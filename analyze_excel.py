
import pandas as pd
import sys
import os

file_path = "docs/directory_list.xlsx"

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    sys.exit(1)

try:
    xl = pd.ExcelFile(file_path, engine='openpyxl')
    print("Sheets found:", xl.sheet_names)
    
    for sheet_name in xl.sheet_names:
        print(f"\n--- Sheet: {sheet_name} ---")
        df = pd.read_excel(file_path, sheet_name=sheet_name, nrows=5, engine='openpyxl')
        print("Columns:", list(df.columns))
        # clean_columns = [col for col in df.columns if not col.startswith('Unnamed')]
        # print("Clean Columns:", clean_columns)
        if not df.empty:
            print("First row data:", df.iloc[0].to_dict())
            
except Exception as e:
    print(f"Error reading excel file: {e}")
