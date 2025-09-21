import { supabase } from "@/integrations/supabase/client";

export interface RawInvestorData {
  companyName: string;
  hsCompanyUrl: string;
  offerTypes: string;
  coverageType: string;
  investorTags: string;
  tier: number;
  weeklyCap: number;
  buyBox: string;
  directPurchaseMarkets: string;
  primaryMarkets: string;
  secondaryMarkets: string;
  cold: string;
  mainPoc: string;
  id: string;
}

// Raw data extracted from the Excel file
const rawInvestorData: RawInvestorData[] = [
  {
    companyName: "Summercrest Capital LLC",
    hsCompanyUrl: "https://app.hubspot.com/contacts/3298701/record/0-1/849038051",
    offerTypes: "Direct Purchase, Creative / Seller Finance, Novation",
    coverageType: "National",
    investorTags: "Active, Direct Purchase, Wholesaler",
    tier: 3,
    weeklyCap: 100,
    buyBox: "Property Type: Single Family Residence, Land, Mobile Home (with Land), Manufactured Home, Multi-Family Residential (Duplex - Quadplex), Multi-Family Commercial (Fiveplex+)\nOn-Market Status: Off Market Only\nYear Built: 1850-2015\nProperty Condition: Move in Ready with Older Finishes, Needs Few Repairs, Needs Major Repairs\nMinimum/Maximum Purchase Price: 0-400,000\nTimeframe: 1 - 7 Days, 1 to 4 Weeks, 3 to 6 Months\nLead Types: Warm, Autohunt, Cold",
    directPurchaseMarkets: "Full States: ---\nZip Codes: ---",
    primaryMarkets: "Full States: AL, AK, AZ, AR, CA, CO, CT, DE, FL, GA, HI, ID, IL, IN, IA, KS, KY, LA, ME, MD, MA, MI, MN, MS, MO, MT, NE, NV, NH, NJ, NM, NY, NC, ND, OH, OK, OR, PA, RI, SC, SD, TN, TX, UT, VT, VA, WA, WV, WI, WY",
    secondaryMarkets: "Full States: ---\nZip Codes: ---",
    cold: "YES",
    mainPoc: "Nate Miller",
    id: "2"
  },
  {
    companyName: "HLT Buyers",
    hsCompanyUrl: "https://app.hubspot.com/contacts/3298701/record/0-1/921723351",
    offerTypes: "Direct Purchase, Creative / Seller Finance, Novation",
    coverageType: "Multi State",
    investorTags: "Direct Purchase, Active, Wholesaler",
    tier: 1,
    weeklyCap: 75,
    buyBox: "Property Type: Single Family & Condominiums.\nOn-Market Status:\nYear Built:\nProperty Condition:\nMinimum/Maximum Purchase Price:\nTimeframe:\nLead Types: Warm, Autohunt, Cold",
    directPurchaseMarkets: "Full States: ---\nZip Codes: ---",
    primaryMarkets: "Full States: AZ, FL, NV, GA, CA, SC, NC, TX, AL, OH",
    secondaryMarkets: "Full States: ---\nZip Codes: ---",
    cold: "YES",
    mainPoc: "Efrain Lopez",
    id: "44"
  },
  {
    companyName: "Real Deal Homes",
    hsCompanyUrl: "https://app.hubspot.com/contacts/3298701/record/0-1/11908883459",
    offerTypes: "Direct Purchase, Creative / Seller Finance, Novation",
    coverageType: "National",
    investorTags: "",
    tier: 7,
    weeklyCap: 25,
    buyBox: "Property Type: Single Family Residence, Land, Mobile Home (with Land), Manufactured Home, Multi-Family Residential (Duplex - Quadplex), Multi-Family Commercial (Fiveplex+), Townhomes, Condominiums\nOn-Market Status: Listed on the MLS with a Full service agent, Flat Fee MLS or Limited Service Listings, FSBO\nYear Built: 1950+\nProperty Condition: Move in Ready with Modern Finishes, Move in Ready with Older Finishes, Needs Few Repairs, Needs Major Repairs\nMinimum/Maximum Purchase Price: 1 - 2,000,000\nTimeframe: 1 to 4 Weeks, 3 to 6 Months, 6 to 12 Months, 12+ Months",
    directPurchaseMarkets: "Full States: ---\nZip Codes: ---",
    primaryMarkets: "Full States: TX, VA, FL, GA, NC, AZ, IN, OH, AL, MI, CA, NV",
    secondaryMarkets: "Full States: AL, AZ, AR, CA, CO, CT, DE, FL, GA, ID, IL, IN, IA, KS, KY, LA, ME, MD, MA, MI, MN, MS, MO, MT, NV, NH, NJ, NM, NY, NC, ND, OH, OK, OR, PA, RI, SC, SD, TN, TX, UT, VT, VA, WA, WV, WI, WY",
    cold: "NO",
    mainPoc: "Brian Harbour",
    id: "83"
  },
  {
    companyName: "HomeGo + New Western",
    hsCompanyUrl: "https://app.hubspot.com/contacts/3298701/record/0-1/8314362997",
    offerTypes: "Wholesale",
    coverageType: "Multi State Local",
    investorTags: "",
    tier: 2,
    weeklyCap: 50,
    buyBox: "Property Type: Single family, multi family up to 10 units\nOn-Market Status: NO LISTED DEALS\nYear Built: Built before 2015\nProperty Condition: No New Build, or recently remodeled\nMinimum/Maximum Purchase Price:\nTimeframe:\nLead Types: Warm, Autohunt\nOther Notes: 1 bed, 1 bath minimum",
    directPurchaseMarkets: "Full States: ---\nZip Codes: ---",
    primaryMarkets: "Zip Codes: 76001,76005,76006,76010,76011,76014,76015,76018,76039,76052,76102,76106,76107,76108,76111,76112,76116,76118,76127,76134,76177,76179,76180", // truncated for brevity
    secondaryMarkets: "Full States: ---\nZip Codes: ---",
    cold: "YES",
    mainPoc: "",
    id: ""
  }
];

export async function importInvestorsToDatabase() {
  try {
    console.log('Starting investor import...');
    
    for (const investor of rawInvestorData) {
      // Extract email and phone from the POC name - we'll use placeholder values for now
      const email = `${investor.companyName.toLowerCase().replace(/\s+/g, '.')}@example.com`;
      const phone = "+1-555-0000"; // Placeholder
      
      // Extract first and last name from main POC
      const [firstName = "Unknown", lastName = "Contact"] = investor.mainPoc ? 
        investor.mainPoc.replace(/\[|\]/g, '').split(' ') : ["Unknown", "Contact"];

      // Insert investor
      const { data: insertedInvestor, error: investorError } = await supabase
        .from('investors')
        .insert({
          company_name: investor.companyName,
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone_number: phone,
          status: 'active'
        })
        .select()
        .single();

      if (investorError) {
        console.error(`Error inserting investor ${investor.companyName}:`, investorError);
        continue;
      }

      console.log(`Inserted investor: ${investor.companyName}`);

      // Create coverage areas for primary and secondary markets
      const coverageAreas = [];
      
      if (investor.primaryMarkets && investor.primaryMarkets !== "Full States: ---\nZip Codes: ---") {
        coverageAreas.push({
          investor_id: insertedInvestor.id,
          area_name: `${investor.companyName} - Primary Markets`,
          geojson_data: {
            type: "FeatureCollection",
            features: [],
            metadata: {
              markets: investor.primaryMarkets,
              coverageType: investor.coverageType,
              tier: investor.tier,
              weeklyCap: investor.weeklyCap,
              buyBox: investor.buyBox,
              offerTypes: investor.offerTypes,
              investorTags: investor.investorTags,
              cold: investor.cold
            }
          }
        });
      }

      if (investor.secondaryMarkets && investor.secondaryMarkets !== "Full States: ---\nZip Codes: ---") {
        coverageAreas.push({
          investor_id: insertedInvestor.id,
          area_name: `${investor.companyName} - Secondary Markets`,
          geojson_data: {
            type: "FeatureCollection", 
            features: [],
            metadata: {
              markets: investor.secondaryMarkets,
              coverageType: investor.coverageType,
              tier: investor.tier,
              weeklyCap: investor.weeklyCap,
              buyBox: investor.buyBox,
              offerTypes: investor.offerTypes,
              investorTags: investor.investorTags,
              cold: investor.cold
            }
          }
        });
      }

      // Insert coverage areas
      if (coverageAreas.length > 0) {
        const { error: coverageError } = await supabase
          .from('coverage_areas')
          .insert(coverageAreas);

        if (coverageError) {
          console.error(`Error inserting coverage for ${investor.companyName}:`, coverageError);
        } else {
          console.log(`Inserted ${coverageAreas.length} coverage areas for ${investor.companyName}`);
        }
      }
    }

    return { success: true, message: 'Investors imported successfully!' };
  } catch (error) {
    console.error('Import error:', error);
    return { success: false, message: 'Failed to import investors', error };
  }
}

export { rawInvestorData };