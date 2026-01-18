"""
Sector-wise Stock Mapping
Maps each NIFTY sector index to its constituent stocks
Reference: https://www.nseindia.com/market-data/live-market-indices
"""

# =============================================================================
# BANKING & FINANCE SECTOR STOCKS
# =============================================================================

# Bank Nifty Stocks
BANK_NIFTY_STOCKS = [
    "HDFCBANK.NS", "ICICIBANK.NS", "SBIN.NS", "KOTAKBANK.NS", "AXISBANK.NS",
    "INDUSINDBK.NS", "BANKBARODA.NS", "PNB.NS", "FEDERALBNK.NS", "IDFCFIRSTB.NS",
    "BANDHANBNK.NS", "AUBANK.NS"
]

# Nifty PSU Bank Stocks
NIFTY_PSU_BANK_STOCKS = [
    "SBIN.NS", "BANKBARODA.NS", "PNB.NS", "CANBK.NS", "UNIONBANK.NS",
    "IOB.NS", "INDIANB.NS", "CENTRALBK.NS", "BANKINDIA.NS", "MAHABANK.NS",
    "PSB.NS", "UCOBANK.NS"
]

# Nifty Private Bank Stocks
NIFTY_PVT_BANK_STOCKS = [
    "HDFCBANK.NS", "ICICIBANK.NS", "KOTAKBANK.NS", "AXISBANK.NS", "INDUSINDBK.NS",
    "FEDERALBNK.NS", "IDFCFIRSTB.NS", "BANDHANBNK.NS", "RBLBANK.NS", "YESBANK.NS"
]

# Nifty Finance (Financial Services) Stocks
NIFTY_FINANCE_STOCKS = [
    "HDFCBANK.NS", "ICICIBANK.NS", "SBIN.NS", "KOTAKBANK.NS", "AXISBANK.NS",
    "BAJFINANCE.NS", "BAJAJFINSV.NS", "HDFCLIFE.NS", "SBILIFE.NS", "ICICIPRULI.NS",
    "ICICIGI.NS", "HDFCAMC.NS", "SBICARD.NS", "CHOLAFIN.NS", "MUTHOOTFIN.NS",
    "PFC.NS", "RECLTD.NS", "SHRIRAMFIN.NS", "LICHSGFIN.NS", "M&MFIN.NS"
]

# =============================================================================
# TECHNOLOGY SECTOR STOCKS
# =============================================================================

# Nifty IT Stocks
NIFTY_IT_STOCKS = [
    "TCS.NS", "INFY.NS", "HCLTECH.NS", "WIPRO.NS", "TECHM.NS",
    "LTIM.NS", "MPHASIS.NS", "COFORGE.NS", "PERSISTENT.NS", "LTTS.NS"
]

# =============================================================================
# HEALTHCARE SECTOR STOCKS
# =============================================================================

# Nifty Pharma Stocks
NIFTY_PHARMA_STOCKS = [
    "SUNPHARMA.NS", "DRREDDY.NS", "CIPLA.NS", "DIVISLAB.NS", "APOLLOHOSP.NS",
    "TORNTPHARM.NS", "ZYDUSLIFE.NS", "BIOCON.NS", "LUPIN.NS", "AUROPHARMA.NS",
    "ALKEM.NS", "GLAND.NS", "IPCALAB.NS", "LAURUSLABS.NS", "NATCOPHARM.NS"
]

# Nifty Healthcare Stocks
NIFTY_HEALTHCARE_STOCKS = [
    "SUNPHARMA.NS", "DRREDDY.NS", "CIPLA.NS", "DIVISLAB.NS", "APOLLOHOSP.NS",
    "TORNTPHARM.NS", "ZYDUSLIFE.NS", "BIOCON.NS", "LUPIN.NS", "AUROPHARMA.NS",
    "MAXHEALTH.NS", "FORTIS.NS", "LALPATHLAB.NS", "METROPOLIS.NS", "SYNGENE.NS",
    "GLAND.NS", "ALKEM.NS", "MANKIND.NS", "GLENMARK.NS", "GRANULES.NS"
]

# =============================================================================
# CONSUMER SECTOR STOCKS
# =============================================================================

# Nifty FMCG Stocks
NIFTY_FMCG_STOCKS = [
    "HINDUNILVR.NS", "ITC.NS", "NESTLEIND.NS", "BRITANNIA.NS", "DABUR.NS",
    "MARICO.NS", "COLPAL.NS", "GODREJCP.NS", "TATACONSUM.NS", "VBL.NS",
    "UBL.NS", "MCDOWELL-N.NS", "PGHH.NS", "EMAMILTD.NS"
]

# Nifty Consumer Durables Stocks
NIFTY_CONSUMER_DURABLES_STOCKS = [
    "TITAN.NS", "HAVELLS.NS", "VOLTAS.NS", "BLUESTARCO.NS", "WHIRLPOOL.NS",
    "CROMPTON.NS", "AMBER.NS", "DIXON.NS", "VGUARD.NS", "RAJESHEXPO.NS",
    "KAJARIACER.NS", "CERA.NS", "BATAINDIA.NS", "RELAXO.NS", "ORIENTELEC.NS"
]

# Nifty India Consumption Stocks
NIFTY_CONSUMPTION_STOCKS = [
    "TITAN.NS", "HINDUNILVR.NS", "ITC.NS", "MARUTI.NS", "NESTLEIND.NS",
    "BRITANNIA.NS", "DABUR.NS", "MARICO.NS", "GODREJCP.NS", "TATACONSUM.NS",
    "COLPAL.NS", "PAGEIND.NS", "TRENT.NS", "DMART.NS", "BATAINDIA.NS",
    "JUBLFOOD.NS", "MCDOWELL-N.NS", "VBL.NS", "INDIGO.NS", "DEVYANI.NS"
]

# =============================================================================
# INDUSTRIAL & MANUFACTURING SECTOR STOCKS
# =============================================================================

# Nifty Auto Stocks
NIFTY_AUTO_STOCKS = [
    "MARUTI.NS", "TATAMOTORS.NS", "M&M.NS", "BAJAJ-AUTO.NS", "HEROMOTOCO.NS",
    "EICHERMOT.NS", "ASHOKLEY.NS", "TVSMOTOR.NS", "MOTHERSON.NS", "BHARATFORG.NS",
    "BALKRISIND.NS", "MRF.NS", "BOSCHLTD.NS", "EXIDEIND.NS"
]

# Nifty Metal Stocks
NIFTY_METAL_STOCKS = [
    "TATASTEEL.NS", "JSWSTEEL.NS", "HINDALCO.NS", "VEDL.NS", "JINDALSTEL.NS",
    "NMDC.NS", "SAIL.NS", "NATIONALUM.NS", "COALINDIA.NS", "APLAPOLLO.NS",
    "RATNAMANI.NS", "WELCORP.NS", "HINDZINC.NS", "MOIL.NS"
]

# Nifty Realty Stocks
NIFTY_REALTY_STOCKS = [
    "DLF.NS", "GODREJPROP.NS", "OBEROIRLTY.NS", "PHOENIXLTD.NS", "PRESTIGE.NS",
    "BRIGADE.NS", "SOBHA.NS", "SUNTECK.NS", "LODHA.NS", "MAHLIFE.NS"
]

# Nifty Infra Stocks
NIFTY_INFRA_STOCKS = [
    "LT.NS", "ADANIPORTS.NS", "ULTRACEMCO.NS", "GRASIM.NS", "SHREECEM.NS",
    "AMBUJACEM.NS", "ACC.NS", "DALBHARAT.NS", "RAMCOCEM.NS", "JKCEMENT.NS",
    "IRCON.NS", "NBCC.NS", "NCC.NS", "PEL.NS", "KEC.NS"
]

# =============================================================================
# ENERGY & RESOURCES SECTOR STOCKS
# =============================================================================

# Nifty Energy Stocks
NIFTY_ENERGY_STOCKS = [
    "RELIANCE.NS", "ONGC.NS", "NTPC.NS", "POWERGRID.NS", "BPCL.NS",
    "IOC.NS", "GAIL.NS", "ADANIGREEN.NS", "TATAPOWER.NS", "ADANIENSOL.NS",
    "PETRONET.NS", "HINDPETRO.NS", "OIL.NS", "MRPL.NS"
]

# Nifty Oil & Gas Stocks
NIFTY_OIL_GAS_STOCKS = [
    "RELIANCE.NS", "ONGC.NS", "BPCL.NS", "IOC.NS", "GAIL.NS",
    "HINDPETRO.NS", "OIL.NS", "PETRONET.NS", "MRPL.NS", "CHENNPETRO.NS",
    "CASTROLIND.NS", "GSPL.NS", "GUJGASLTD.NS", "MGL.NS", "IGL.NS"
]

# =============================================================================
# OTHER SECTOR STOCKS
# =============================================================================

# Nifty Media Stocks
NIFTY_MEDIA_STOCKS = [
    "ZEEL.NS", "PVRINOX.NS", "SUNTV.NS", "TV18BRDCST.NS", "NETWORK18.NS",
    "DISHTV.NS", "HATHWAY.NS", "NAZARA.NS", "SAREGAMA.NS", "TIPS.NS"
]

# Nifty Commodities Stocks
NIFTY_COMMODITIES_STOCKS = [
    "RELIANCE.NS", "ONGC.NS", "COALINDIA.NS", "TATASTEEL.NS", "JSWSTEEL.NS",
    "HINDALCO.NS", "VEDL.NS", "JINDALSTEL.NS", "NMDC.NS", "GAIL.NS",
    "IOC.NS", "BPCL.NS", "UPL.NS", "PIDILITIND.NS", "TATACHEMICALS.NS"
]

# Nifty MNC Stocks
NIFTY_MNC_STOCKS = [
    "HINDUNILVR.NS", "MARUTI.NS", "NESTLEIND.NS", "COLPAL.NS", "PGHH.NS",
    "SIEMENS.NS", "ABB.NS", "HONAUT.NS", "3MINDIA.NS", "WHIRLPOOL.NS",
    "GLAXO.NS", "PFIZER.NS", "SANOFI.NS", "CASTROLIND.NS", "CUMMINSIND.NS"
]

# Nifty Services Stocks
NIFTY_SERVICES_STOCKS = [
    "TCS.NS", "INFY.NS", "HCLTECH.NS", "WIPRO.NS", "TECHM.NS",
    "INDIGO.NS", "ZOMATO.NS", "NYKAA.NS", "PAYTM.NS", "IRCTC.NS",
    "DMART.NS", "TRENT.NS", "JUBLFOOD.NS", "YATRA.NS", "MAKEMYTRIP.NS"
]

# Nifty PSE (Public Sector Enterprises) Stocks
NIFTY_PSE_STOCKS = [
    "ONGC.NS", "NTPC.NS", "POWERGRID.NS", "COALINDIA.NS", "IOC.NS",
    "BPCL.NS", "GAIL.NS", "BHEL.NS", "NMDC.NS", "CONCOR.NS",
    "IRFC.NS", "RECLTD.NS", "PFC.NS", "SAIL.NS", "NATIONALUM.NS"
]

# Nifty CPSE (Central Public Sector Enterprises) Stocks
NIFTY_CPSE_STOCKS = [
    "ONGC.NS", "NTPC.NS", "POWERGRID.NS", "COALINDIA.NS", "IOC.NS",
    "BPCL.NS", "GAIL.NS", "BHEL.NS", "NMDC.NS", "OIL.NS",
    "NHPC.NS", "SJVN.NS", "IRFC.NS", "IRCTC.NS", "BEL.NS"
]

# =============================================================================
# THEMATIC SECTOR STOCKS
# =============================================================================

# Nifty India Defence Stocks
NIFTY_DEFENCE_STOCKS = [
    "HAL.NS", "BEL.NS", "BHEL.NS", "BEML.NS", "BDL.NS",
    "COCHINSHIP.NS", "GRSE.NS", "MAZAGON.NS", "PARAS.NS", "DATAPATTNS.NS",
    "SOLARINDS.NS", "AABORATORY.NS", "MIDHANI.NS", "ASTRAZEN.NS"
]

# Nifty India Manufacturing Stocks
NIFTY_MANUFACTURING_STOCKS = [
    "RELIANCE.NS", "TATAMOTORS.NS", "MARUTI.NS", "M&M.NS", "TATASTEEL.NS",
    "JSWSTEEL.NS", "HINDALCO.NS", "ULTRACEMCO.NS", "GRASIM.NS", "LT.NS",
    "SIEMENS.NS", "ABB.NS", "HAVELLS.NS", "POLYCAB.NS", "DIXON.NS",
    "BHARATFORG.NS", "BOSCHLTD.NS", "CUMMINSIND.NS", "SCHAEFFLER.NS"
]

# Nifty India Digital Stocks
NIFTY_DIGITAL_STOCKS = [
    "TCS.NS", "INFY.NS", "HCLTECH.NS", "WIPRO.NS", "TECHM.NS",
    "ZOMATO.NS", "NYKAA.NS", "PAYTM.NS", "POLICYBZR.NS", "DELHIVERY.NS",
    "CARTRADE.NS", "EASEMYTRIP.NS", "MAPMYINDIA.NS", "LATENTVIEW.NS"
]

# Nifty Capital Markets Stocks
NIFTY_CAPITAL_MARKETS_STOCKS = [
    "HDFCAMC.NS", "NIPPONIND.NS", "UTIAMC.NS", "ANGELONE.NS", "ICICIPRULI.NS",
    "SBILIFE.NS", "HDFCLIFE.NS", "BSE.NS", "CDSL.NS", "CAMS.NS",
    "KFINTECH.NS", "IIFL.NS", "MOTILALOSF.NS", "360ONE.NS"
]

# Nifty Chemicals Stocks
NIFTY_CHEMICALS_STOCKS = [
    "PIDILITIND.NS", "UPL.NS", "SRF.NS", "ATUL.NS", "DEEPAKNTR.NS",
    "NAVINFLUOR.NS", "FLUOROCHEM.NS", "CLEAN.NS", "AARTI.NS", "FINEORG.NS",
    "VINATIORGA.NS", "ALKYLAMINE.NS", "GALAXYSURF.NS", "TATACHEM.NS"
]

# Nifty Housing Stocks
NIFTY_HOUSING_STOCKS = [
    "DLF.NS", "GODREJPROP.NS", "OBEROIRLTY.NS", "PRESTIGE.NS", "LODHA.NS",
    "BRIGADE.NS", "SOBHA.NS", "PHOENIXLTD.NS", "SUNTECK.NS", "MAHLIFE.NS",
    "ULTRACEMCO.NS", "SHREECEM.NS", "AMBUJACEM.NS", "PIDILITIND.NS", "ASTRAL.NS"
]

# Nifty Transport & Logistics Stocks
NIFTY_TRANSPORT_STOCKS = [
    "ADANIPORTS.NS", "CONCOR.NS", "DELHIVERY.NS", "BLUEDART.NS", "GATI.NS",
    "TCI.NS", "VRL.NS", "ALLCARGO.NS", "MAHSEAMLES.NS", "AEGISCHEM.NS",
    "INDIGO.NS", "SPICEJET.NS"
]

# Nifty EV & New Age Automotive Stocks
NIFTY_EV_STOCKS = [
    "TATAMOTORS.NS", "M&M.NS", "MARUTI.NS", "BAJAJ-AUTO.NS", "HEROMOTOCO.NS",
    "TVSMOTOR.NS", "OLECTRA.NS", "EXIDEIND.NS", "AMARAJABAT.NS", "MOTHERSON.NS",
    "BOSCHLTD.NS", "TATAELXSI.NS", "KPITTECH.NS", "TATPOWER.NS"
]

# Nifty India Tourism Stocks
NIFTY_TOURISM_STOCKS = [
    "INDIGO.NS", "IRCTC.NS", "IHCL.NS", "LEMONTRE.NS", "CHALET.NS",
    "MAHINDHOLIDAY.NS", "THOMASCOOK.NS", "EASEMYTRIP.NS", "YATRA.NS"
]

# Nifty Rural Stocks
NIFTY_RURAL_STOCKS = [
    "M&M.NS", "ESCORTS.NS", "HINDUNILVR.NS", "ITC.NS", "DABUR.NS",
    "MARICO.NS", "TATACONSUM.NS", "BAJAJFINSV.NS", "HEROMOTOCO.NS", "BHARATFORG.NS",
    "UPL.NS", "TATACHEM.NS", "COROMANDEL.NS", "PIIND.NS"
]

# Nifty Mobility Stocks
NIFTY_MOBILITY_STOCKS = [
    "MARUTI.NS", "TATAMOTORS.NS", "M&M.NS", "BAJAJ-AUTO.NS", "HEROMOTOCO.NS",
    "TVSMOTOR.NS", "ASHOKLEY.NS", "EICHERMOT.NS", "INDIGO.NS", "IRCTC.NS",
    "ADANIPORTS.NS", "CONCOR.NS", "DELHIVERY.NS"
]

# =============================================================================
# BROAD MARKET INDEX STOCKS (Representative)
# =============================================================================

# Nifty Midcap Stocks (Top 20)
NIFTY_MIDCAP_STOCKS = [
    "POLYCAB.NS", "TRENT.NS", "PERSISTENT.NS", "MPHASIS.NS", "COFORGE.NS",
    "VOLTAS.NS", "ASTRAL.NS", "BHARATFORG.NS", "CUMMINSIND.NS", "SYNGENE.NS",
    "PAGEIND.NS", "AFFLE.NS", "ESCORTS.NS", "CROMPTON.NS", "SUPREMEIND.NS",
    "FLUOROCHEM.NS", "KPITTECH.NS", "SONACOMS.NS", "HAPPSTMNDS.NS", "ANGELONE.NS"
]

# Nifty Smallcap Representative Stocks
NIFTY_SMALLCAP_STOCKS = [
    "HAPPSTMNDS.NS", "ROUTE.NS", "LATENTVIEW.NS", "DATAPATTNS.NS", "CAMPUS.NS",
    "KAYNES.NS", "ELECTRONICS.NS", "MEDPLUS.NS", "SAPPHIRE.NS", "FIVESTAR.NS",
    "HOMEFIRST.NS", "DREAMFOLKS.NS", "TARSONS.NS", "BIKAJI.NS", "EPIGRAL.NS"
]

# =============================================================================
# SECTOR STOCKS MAPPING
# =============================================================================

SECTOR_STOCKS_MAP = {
    # Banking & Finance
    "Bank Nifty": BANK_NIFTY_STOCKS,
    "Nifty PSU Bank": NIFTY_PSU_BANK_STOCKS,
    "Nifty Pvt Bank": NIFTY_PVT_BANK_STOCKS,
    "Nifty Finance": NIFTY_FINANCE_STOCKS,
    
    # Technology
    "Nifty IT": NIFTY_IT_STOCKS,
    
    # Healthcare
    "Nifty Pharma": NIFTY_PHARMA_STOCKS,
    "Nifty Healthcare": NIFTY_HEALTHCARE_STOCKS,
    
    # Consumer
    "Nifty FMCG": NIFTY_FMCG_STOCKS,
    "Nifty Consumer Durables": NIFTY_CONSUMER_DURABLES_STOCKS,
    "Nifty India Consumption": NIFTY_CONSUMPTION_STOCKS,
    
    # Industrial & Manufacturing
    "Nifty Auto": NIFTY_AUTO_STOCKS,
    "Nifty Metal": NIFTY_METAL_STOCKS,
    "Nifty Realty": NIFTY_REALTY_STOCKS,
    "Nifty Infra": NIFTY_INFRA_STOCKS,
    
    # Energy & Resources
    "Nifty Energy": NIFTY_ENERGY_STOCKS,
    "Nifty Oil & Gas": NIFTY_OIL_GAS_STOCKS,
    
    # Others
    "Nifty Media": NIFTY_MEDIA_STOCKS,
    "Nifty Commodities": NIFTY_COMMODITIES_STOCKS,
    "Nifty MNC": NIFTY_MNC_STOCKS,
    "Nifty Services": NIFTY_SERVICES_STOCKS,
    "Nifty PSE": NIFTY_PSE_STOCKS,
    "Nifty CPSE": NIFTY_CPSE_STOCKS,
    
    # Thematic
    "Nifty India Defence": NIFTY_DEFENCE_STOCKS,
    "Nifty India Manufacturing": NIFTY_MANUFACTURING_STOCKS,
    "Nifty India Digital": NIFTY_DIGITAL_STOCKS,
    "Nifty Capital Markets": NIFTY_CAPITAL_MARKETS_STOCKS,
    "Nifty Chemicals": NIFTY_CHEMICALS_STOCKS,
    "Nifty Housing": NIFTY_HOUSING_STOCKS,
    "Nifty Transport & Logistics": NIFTY_TRANSPORT_STOCKS,
    "Nifty EV & New Age Auto": NIFTY_EV_STOCKS,
    "Nifty India Tourism": NIFTY_TOURISM_STOCKS,
    "Nifty Rural": NIFTY_RURAL_STOCKS,
    "Nifty Mobility": NIFTY_MOBILITY_STOCKS,
    
    # Broad Market
    "Nifty Midcap 100": NIFTY_MIDCAP_STOCKS,
    "Nifty Midcap 50": NIFTY_MIDCAP_STOCKS,
    "Nifty Smallcap 100": NIFTY_SMALLCAP_STOCKS,
    "Nifty Smallcap 50": NIFTY_SMALLCAP_STOCKS,
}

# All sector stocks combined (unique)
ALL_SECTOR_STOCKS = list(set(
    BANK_NIFTY_STOCKS + NIFTY_IT_STOCKS + NIFTY_PHARMA_STOCKS + 
    NIFTY_FMCG_STOCKS + NIFTY_AUTO_STOCKS + NIFTY_METAL_STOCKS +
    NIFTY_REALTY_STOCKS + NIFTY_ENERGY_STOCKS + NIFTY_FINANCE_STOCKS +
    NIFTY_PSU_BANK_STOCKS + NIFTY_PVT_BANK_STOCKS + NIFTY_MEDIA_STOCKS +
    NIFTY_INFRA_STOCKS + NIFTY_MIDCAP_STOCKS + NIFTY_HEALTHCARE_STOCKS +
    NIFTY_CONSUMER_DURABLES_STOCKS + NIFTY_CONSUMPTION_STOCKS +
    NIFTY_OIL_GAS_STOCKS + NIFTY_COMMODITIES_STOCKS + NIFTY_MNC_STOCKS +
    NIFTY_SERVICES_STOCKS + NIFTY_PSE_STOCKS + NIFTY_CPSE_STOCKS +
    NIFTY_DEFENCE_STOCKS + NIFTY_MANUFACTURING_STOCKS + NIFTY_DIGITAL_STOCKS +
    NIFTY_CAPITAL_MARKETS_STOCKS + NIFTY_CHEMICALS_STOCKS + NIFTY_HOUSING_STOCKS +
    NIFTY_TRANSPORT_STOCKS + NIFTY_EV_STOCKS + NIFTY_TOURISM_STOCKS +
    NIFTY_RURAL_STOCKS + NIFTY_MOBILITY_STOCKS + NIFTY_SMALLCAP_STOCKS
))
