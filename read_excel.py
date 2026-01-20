import pandas as pd
import sys

try:
    xls = pd.ExcelFile('Приложение_Пример_ведения_ПА_в_электронном_формате.xlsx')
    print("Листы в файле:", xls.sheet_names)
    print("\n" + "="*80 + "\n")
    
    for sheet in xls.sheet_names:
        print(f"\n{'='*80}")
        print(f"ЛИСТ: {sheet}")
        print(f"{'='*80}\n")
        df = pd.read_excel(xls, sheet_name=sheet)
        print(df.to_string())
        print("\n")
        
except Exception as e:
    print(f"Ошибка: {e}")
    import traceback
    traceback.print_exc()
