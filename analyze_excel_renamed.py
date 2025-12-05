
import pandas as pd
import sys
import os

file_path = "docs/directory_list_temp.xls"

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    sys.exit(1)

try:
    # Attempt to read with xlrd explicitly
    xl = pd.ExcelFile(file_path, engine='xlrd')
    print("Sheets found:", xl.sheet_names)
    
    for sheet_name in xl.sheet_names:
        print(f"\n--- Sheet: {sheet_name} ---")
        df = pd.read_excel(file_path, sheet_name=sheet_name, nrows=5, engine='xlrd')
        print("Columns:", list(df.columns))
        # Print first row to see data sample
        if not df.empty:
            print("First row data:", df.iloc[0].to_dict())
            
except Exception as e:
    print(f"Error reading excel file: {e}")
