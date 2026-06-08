import os
import sys
import django
import csv
import shutil
import zipfile

# Set up Django environment and add root path to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "my_pharma.settings")
django.setup()

from django.apps import apps


def main():
    print("=== STARTING DATABASE EXPORT TO CSV ===")
    
    # 1. Discover models in authentication and core apps
    app_labels = ("authentication", "core")
    app_models = [
        m for m in apps.get_models() if m._meta.app_label in app_labels
    ]
    
    # Define directories
    temp_export_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "db_csv_export")
    os.makedirs(temp_export_dir, exist_ok=True)
    
    # Artifact destination directory
    artifacts_dir = "/Users/shihab/.gemini/antigravity-ide/brain/ff486678-acf3-4cb5-9f9a-fecff03fce07"
    os.makedirs(artifacts_dir, exist_ok=True)
    zip_output_path = os.path.join(artifacts_dir, "mypharma_db_export.zip")
    
    print(f"Exporting individual CSVs to temporary directory: {temp_export_dir}")
    
    # 2. Export each table to CSV
    for model in app_models:
        table_name = model._meta.db_table
        csv_file_path = os.path.join(temp_export_dir, f"{table_name}.csv")
        
        # Get all database column attribute names (e.g. parent_id instead of parent object)
        fields = [field.attname for field in model._meta.fields]
        
        # Retrieve all records
        records = model.objects.all()
        
        try:
            with open(csv_file_path, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                
                # Write header row
                writer.writerow(fields)
                
                # Write data rows
                for obj in records:
                    row = []
                    for field in fields:
                        val = getattr(obj, field)
                        # Format complex types (like datetimes, dicts, etc.) as strings
                        if val is None:
                            row.append("")
                        elif isinstance(val, (bytes, bytearray)):
                            row.append("<binary data>")
                        else:
                            row.append(str(val))
                    writer.writerow(row)
            
            print(f"  Exported {table_name:<35} | Records: {len(records)}")
        except Exception as e:
            print(f"  Error exporting {table_name}: {e}")
            
    # 3. Create ZIP archive
    print(f"\nCreating ZIP archive at: {zip_output_path}")
    try:
        with zipfile.ZipFile(zip_output_path, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for root, dirs, files in os.walk(temp_export_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    # Add to zip with relative path
                    zip_file.write(file_path, os.path.basename(file_path))
                    
        print(f"ZIP archive created successfully with {len(app_models)} CSV files.")
    except Exception as e:
        print(f"Error creating ZIP archive: {e}")
        return
        
    # 4. Clean up temporary directory
    print(f"Cleaning up temporary directory: {temp_export_dir}")
    try:
        shutil.rmtree(temp_export_dir)
        print("Cleanup complete.")
    except Exception as e:
        print(f"Error cleaning up temporary directory: {e}")
        
    print("\n=== EXPORT SUCCESSFULLY COMPLETED ===")
    print(f"Your zip archive is saved at:\n{zip_output_path}")


if __name__ == "__main__":
    main()
