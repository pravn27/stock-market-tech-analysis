"""
Data Source Validator
Validates that all configured symbols return valid historical data.
Run this periodically to catch data source issues early.
"""

import yfinance as yf
from typing import Dict, List, Tuple
from datetime import datetime


def validate_yahoo_symbol(symbol: str, name: str) -> Tuple[bool, str, float]:
    """
    Validate a Yahoo Finance symbol returns valid data.
    
    Returns:
        (is_valid, message, weekly_return or None)
    """
    if symbol.startswith("NSE:"):
        return True, "NSE fallback - skip Yahoo validation", None
    
    try:
        ticker = yf.Ticker(symbol)
        df = ticker.history(period="1mo")
        
        if df.empty:
            return False, f"❌ Empty data", None
        
        if len(df) < 5:
            return False, f"⚠️ Only {len(df)} days of data", None
        
        # Calculate weekly return
        current = df['Close'].iloc[-1]
        week_ago = df['Close'].iloc[-5] if len(df) >= 5 else df['Close'].iloc[0]
        weekly_return = ((current - week_ago) / week_ago) * 100
        
        return True, f"✓ Valid ({len(df)} days)", weekly_return
        
    except Exception as e:
        return False, f"❌ Error: {str(e)[:50]}", None


def validate_all_indices(indices: Dict[str, str]) -> Dict:
    """
    Validate all indices in a dictionary.
    
    Returns summary of validation results.
    """
    results = {
        'valid': [],
        'invalid': [],
        'nse_fallback': [],
        'timestamp': datetime.now().isoformat()
    }
    
    print(f"\n{'='*70}")
    print(f"DATA SOURCE VALIDATION - {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"{'='*70}\n")
    
    for name, symbol in indices.items():
        if symbol.startswith("NSE:"):
            results['nse_fallback'].append({'name': name, 'symbol': symbol})
            print(f"🔄 {name:30} {symbol:20} NSE fallback")
            continue
            
        is_valid, message, weekly_ret = validate_yahoo_symbol(symbol, name)
        
        entry = {
            'name': name,
            'symbol': symbol,
            'message': message,
            'weekly_return': weekly_ret
        }
        
        if is_valid:
            results['valid'].append(entry)
            ret_str = f"{weekly_ret:+.2f}%" if weekly_ret else ""
            print(f"✓ {name:30} {symbol:20} {ret_str:>10} {message}")
        else:
            results['invalid'].append(entry)
            print(f"❌ {name:30} {symbol:20} {message}")
    
    # Summary
    print(f"\n{'='*70}")
    print(f"SUMMARY:")
    print(f"  Valid:        {len(results['valid'])}")
    print(f"  Invalid:      {len(results['invalid'])}")
    print(f"  NSE Fallback: {len(results['nse_fallback'])}")
    print(f"{'='*70}\n")
    
    if results['invalid']:
        print("⚠️  ACTION REQUIRED: Fix invalid symbols or add NSE fallback")
        for item in results['invalid']:
            print(f"    - {item['name']}: {item['symbol']}")
    
    return results


def compare_with_reference(symbol: str, name: str, expected_return: float, tolerance: float = 1.0) -> bool:
    """
    Compare calculated return with a reference value (e.g., from TradingView).
    
    Args:
        symbol: Yahoo Finance symbol
        name: Index name
        expected_return: Expected weekly return from reference source
        tolerance: Acceptable difference in percentage points
    
    Returns:
        True if within tolerance, False otherwise
    """
    is_valid, _, actual_return = validate_yahoo_symbol(symbol, name)
    
    if not is_valid or actual_return is None:
        print(f"❌ {name}: Cannot validate - no data")
        return False
    
    diff = abs(actual_return - expected_return)
    
    if diff <= tolerance:
        print(f"✓ {name}: Actual {actual_return:+.2f}% vs Expected {expected_return:+.2f}% (diff: {diff:.2f}%)")
        return True
    else:
        print(f"❌ {name}: Actual {actual_return:+.2f}% vs Expected {expected_return:+.2f}% (diff: {diff:.2f}% > {tolerance}%)")
        return False


# Quick validation function for testing
def quick_validate():
    """Run quick validation on main sectors"""
    from core.sector_scanner import NIFTY_SECTORS_MAIN
    return validate_all_indices(NIFTY_SECTORS_MAIN)


if __name__ == "__main__":
    # Run validation
    from sector_scanner import NIFTY_SECTORS_MAIN, NIFTY_BROAD_INDICES, NIFTY_ALL_SECTORS
    
    print("\n" + "="*70)
    print("VALIDATING NIFTY_SECTORS_MAIN")
    validate_all_indices(NIFTY_SECTORS_MAIN)
    
    print("\n" + "="*70)
    print("VALIDATING NIFTY_BROAD_INDICES")
    validate_all_indices(NIFTY_BROAD_INDICES)
