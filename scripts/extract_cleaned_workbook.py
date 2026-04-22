from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any
from xml.etree import ElementTree as ET
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[1]
SOURCE_XLSX = ROOT / "data_cleaned.xlsx"
OUTPUT_DIR = ROOT / "data"

NS_MAIN = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
NS_REL = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"

CATEGORY_META = {
    "Electronics": {"name": "إلكترونيات", "color": "#4361EE"},
    "Sports": {"name": "رياضة", "color": "#1D9E75"},
    "Books": {"name": "كتب", "color": "#BA7517"},
    "Clothes": {"name": "ملابس", "color": "#993556"},
    "Toys": {"name": "ألعاب", "color": "#993C1D"},
    "Perfumes": {"name": "عطور", "color": "#0F6E56"},
    "Home Appliances": {"name": "أجهزة منزلية", "color": "#185FA5"},
}


def parse_int(value: Any) -> int:
    if value is None or value == "":
        return 0
    return int(float(value))


def parse_float(value: Any) -> float:
    if value is None or value == "":
        return 0.0
    return float(value)


def normalize_row(row: list[Any], width: int) -> list[Any]:
    if len(row) >= width:
        return row[:width]
    return row + [None] * (width - len(row))


def read_workbook(path: Path) -> dict[str, list[list[Any]]]:
    with ZipFile(path) as archive:
        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        relationships = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        relationship_map = {
            rel.attrib["Id"]: rel.attrib["Target"] for rel in relationships
        }

        shared_strings: list[str] = []
        if "xl/sharedStrings.xml" in archive.namelist():
            shared_root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            for shared_item in shared_root:
                text = "".join(node.text or "" for node in shared_item.iter(f"{NS_MAIN}t"))
                shared_strings.append(text)

        def cell_value(cell: ET.Element) -> Any:
            cell_type = cell.attrib.get("t")
            value_node = cell.find(f"{NS_MAIN}v")
            if value_node is None:
                inline_node = cell.find(f"{NS_MAIN}is")
                if inline_node is None:
                    return None
                return "".join(
                    node.text or "" for node in inline_node.iter(f"{NS_MAIN}t")
                )

            raw_value = value_node.text
            if cell_type == "s":
                return shared_strings[int(raw_value)]
            return raw_value

        sheets: dict[str, list[list[Any]]] = {}
        sheet_nodes = workbook.find(f"{NS_MAIN}sheets")
        if sheet_nodes is None:
            return sheets

        for sheet in sheet_nodes:
            name = sheet.attrib["name"]
            relationship_id = sheet.attrib[f"{NS_REL}id"]
            target = "xl/" + relationship_map[relationship_id]
            worksheet = ET.fromstring(archive.read(target))

            rows: list[list[Any]] = []
            sheet_data = worksheet.find(f"{NS_MAIN}sheetData")
            if sheet_data is None:
                sheets[name] = rows
                continue

            for row in sheet_data:
                rows.append([cell_value(cell) for cell in row])

            sheets[name] = rows

        return sheets


def extract_table(rows: list[list[Any]]) -> list[dict[str, Any]]:
    if len(rows) < 2:
        return []

    header = rows[1]
    width = len(header)
    first_key = header[0]
    records: list[dict[str, Any]] = []

    for row in rows[2:]:
        normalized = normalize_row(row, width)
        record = {header[index]: normalized[index] for index in range(width)}
        if not str(record.get(first_key, "")).isdigit():
            continue
        records.append(record)

    return records


def fitness_score(viewed: int, clicked: int, purchased: int, rating: int) -> int:
    return (purchased * 5) + (clicked * 2) + (viewed * 1) + (rating * 3)


def main() -> None:
    workbook = read_workbook(SOURCE_XLSX)

    users_rows = extract_table(workbook["users_clean"])
    products_rows = extract_table(workbook["products_clean"])
    ratings_rows = extract_table(workbook["ratings_clean"])
    behavior_rows = extract_table(workbook["behavior_clean"])

    users = [
        {
            "user_id": parse_int(row["user_id"]),
            "age": parse_int(row["age"]),
            "country": str(row["country"]),
        }
        for row in users_rows
    ]

    ratings_by_pair: dict[tuple[int, int], int] = {}
    ratings_by_product: defaultdict[int, list[int]] = defaultdict(list)
    rating_distribution = Counter()

    for row in ratings_rows:
        user_id = parse_int(row["user_id"])
        product_id = parse_int(row["product_id"])
        rating = parse_int(row["rating"])
        ratings_by_pair[(user_id, product_id)] = rating
        ratings_by_product[product_id].append(rating)
        rating_distribution[rating] += 1

    behavior_by_product: defaultdict[int, dict[str, int]] = defaultdict(
        lambda: {"views": 0, "clicks": 0, "purchases": 0}
    )
    interactions = []

    total_views = 0
    total_clicks = 0
    total_purchases = 0

    for row in behavior_rows:
        user_id = parse_int(row["user_id"])
        product_id = parse_int(row["product_id"])
        viewed = parse_int(row["viewed"])
        clicked = parse_int(row["clicked"])
        purchased = parse_int(row["purchased"])
        rating = ratings_by_pair.get((user_id, product_id), 0)
        fitness = fitness_score(viewed, clicked, purchased, rating)

        total_views += viewed
        total_clicks += clicked
        total_purchases += purchased

        behavior_by_product[product_id]["views"] += viewed
        behavior_by_product[product_id]["clicks"] += clicked
        behavior_by_product[product_id]["purchases"] += purchased

        interactions.append(
            {
                "user_id": user_id,
                "product_id": product_id,
                "viewed": viewed,
                "clicked": clicked,
                "purchased": purchased,
                "rating": rating,
                "fitness": fitness,
            }
        )

    products = []
    category_counts = Counter()

    for row in products_rows:
        product_id = parse_int(row["product_id"])
        category = str(row["category"])
        price = parse_float(row["price"])

        rating_values = ratings_by_product[product_id]
        product_rating = round(sum(rating_values) / len(rating_values), 1) if rating_values else 0
        product_metrics = behavior_by_product[product_id]

        category_counts[category] += 1
        products.append(
            {
                "product_id": product_id,
                "name": f"منتج رقم {product_id}",
                "category": category,
                "price": round(price, 2),
                "rating": product_rating,
                "rating_count": len(rating_values),
                "views": product_metrics["views"],
                "clicks": product_metrics["clicks"],
                "purchases": product_metrics["purchases"],
            }
        )

    products.sort(key=lambda product: product["product_id"])
    users.sort(key=lambda user: user["user_id"])
    interactions.sort(key=lambda row: (row["user_id"], row["product_id"]))

    prices = [product["price"] for product in products]
    total_products = len(products)
    total_ratings = len(ratings_rows)
    total_users = len(users)
    total_behaviors = len(behavior_rows)

    category_distribution = []
    for category, count in sorted(category_counts.items()):
        meta = CATEGORY_META.get(category, {"name": category, "color": "#64748B"})
        category_distribution.append(
            {
                "id": category,
                "name": meta["name"],
                "color": meta["color"],
                "count": count,
                "percentage": round((count / total_products) * 100, 1),
            }
        )

    rating_distribution_output = []
    for score in range(1, 6):
        count = rating_distribution.get(score, 0)
        rating_distribution_output.append(
            {
                "score": score,
                "count": count,
                "percentage": round((count / total_ratings) * 100, 1) if total_ratings else 0,
            }
        )

    top_products = sorted(
        products,
        key=lambda product: (
            product["purchases"],
            product["clicks"],
            product["rating"],
            -product["product_id"],
        ),
        reverse=True,
    )[:5]

    summary = {
        "totalUsers": total_users,
        "totalProducts": total_products,
        "totalRatings": total_ratings,
        "totalBehaviorRows": total_behaviors,
        "maxFitnessScore": 23,
        "pricing": {
            "min": min(prices) if prices else 0,
            "max": max(prices) if prices else 0,
            "avg": round(sum(prices) / len(prices), 2) if prices else 0,
        },
        "funnel": {
            "views": total_views,
            "clicks": total_clicks,
            "purchases": total_purchases,
            "clickRate": round((total_clicks / total_views) * 100, 1) if total_views else 0,
            "purchaseRate": round((total_purchases / total_views) * 100, 1) if total_views else 0,
            "purchaseFromClicksRate": round((total_purchases / total_clicks) * 100, 1)
            if total_clicks
            else 0,
        },
        "categoryDistribution": category_distribution,
        "ratingDistribution": rating_distribution_output,
        "topProducts": top_products,
    }

    OUTPUT_DIR.mkdir(exist_ok=True)
    (OUTPUT_DIR / "users.json").write_text(
        json.dumps(users, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (OUTPUT_DIR / "products.json").write_text(
        json.dumps(products, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (OUTPUT_DIR / "interactions.json").write_text(
        json.dumps(interactions, ensure_ascii=False),
        encoding="utf-8",
    )
    (OUTPUT_DIR / "summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print("Generated:")
    print(f"  - {OUTPUT_DIR / 'users.json'}")
    print(f"  - {OUTPUT_DIR / 'products.json'}")
    print(f"  - {OUTPUT_DIR / 'interactions.json'}")
    print(f"  - {OUTPUT_DIR / 'summary.json'}")


if __name__ == "__main__":
    main()
