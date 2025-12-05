
import sys

file_path = "docs/directory_list.xlsx"

try:
    with open(file_path, 'rb') as f:
        header = f.read(8)
    print(f"File header: {header.hex()}")
    
    # Check for OLECF signature (D0 CF 11 E0 A1 B1 1A E1) - typical for .xls
    if header.hex().upper().startswith("D0CF11E0"):
        print("Signature matches OLECF (likely .xls)")
    # Check for Zip signature (50 4B 03 04) - typical for .xlsx
    elif header.hex().upper().startswith("504B0304"):
        print("Signature matches Zip (likely .xlsx)")
    else:
        print("Unknown signature")
        
except Exception as e:
    print(f"Error: {e}")
