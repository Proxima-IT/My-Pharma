import os
import sys
import django
from decimal import Decimal
import datetime
import json

# Set up Django environment and add root path to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "my_pharma.settings")
django.setup()

from django.apps import apps


def escape_sql_value(val):
    """Formats and escapes values to be safe for a MySQL SQL insert script."""
    if val is None:
        return "NULL"
    elif isinstance(val, bool):
        return "1" if val else "0"
    elif isinstance(val, (int, float)):
        return str(val)
    elif isinstance(val, Decimal):
        return f"{val:.2f}"
    elif isinstance(val, (datetime.datetime, datetime.date)):
        return f"'{val}'"
    elif isinstance(val, (dict, list)):
        # For JSON fields
        serialized = json.dumps(val)
        escaped = serialized.replace("'", "''").replace("\\", "\\\\")
        return f"'{escaped}'"
    else:
        # String and fallbacks
        escaped = str(val).replace("'", "''").replace("\\", "\\\\")
        return f"'{escaped}'"


def main():
    print("=== STARTING DATABASE EXPORT TO SQL ===")
    
    app_labels = ("authentication", "core")
    app_models = [
        m for m in apps.get_models() if m._meta.app_label in app_labels
    ]
    
    # Sort models so that parent tables are processed before children (if possible),
    # but since we disable FOREIGN_KEY_CHECKS, order doesn't strictly matter.
    output_sql_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "mypharma_db_export.sql"
    )
    
    sql_lines = [
        "-- My-Pharma Database Dump",
        "-- Generated automatically by export_db_to_sql.py",
        f"-- Date: {datetime.datetime.now()}",
        "",
        "SET FOREIGN_KEY_CHECKS = 0;",
        ""
    ]
    
    for model in app_models:
        table_name = model._meta.db_table
        fields = [field.attname for field in model._meta.fields]
        records = model.objects.all()
        
        if not records.exists():
            continue
            
        print(f"  Exporting table {table_name:<35} | Records: {len(records)}")
        
        sql_lines.append(f"-- Table data for {table_name}")
        sql_lines.append(f"TRUNCATE TABLE `{table_name}`;")
        
        # Prepare fields header
        fields_str = ", ".join([f"`{f}`" for f in fields])
        
        for obj in records:
            values = []
            for field in fields:
                val = getattr(obj, field)
                values.append(escape_sql_value(val))
            values_str = ", ".join(values)
            sql_lines.append(f"INSERT INTO `{table_name}` ({fields_str}) VALUES ({values_str});")
            
        sql_lines.append("")
        
    sql_lines.append("SET FOREIGN_KEY_CHECKS = 1;")
    sql_lines.append("")
    
    # Write to target file
    with open(output_sql_path, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_lines))
        
    print(f"\n=== EXPORT SUCCESSFULLY COMPLETED ===")
    print(f"SQL file saved at:\n{output_sql_path}")


if __name__ == "__main__":
    main()
