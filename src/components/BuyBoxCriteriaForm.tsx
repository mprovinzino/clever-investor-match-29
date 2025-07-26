import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface BuyBoxCriteriaFormProps {
  register: any;
  watch: any;
  setValue: any;
  errors: any;
  prefix?: string; // For form field prefixes
}

export const BuyBoxCriteriaForm = ({ register, watch, setValue, errors, prefix = "" }: BuyBoxCriteriaFormProps) => {
  const propertyTypes = [
    { value: "single_family", label: "Single Family Home" },
    { value: "duplex", label: "Duplex" },
    { value: "triplex", label: "Triplex" },
    { value: "fourplex", label: "Fourplex" },
    { value: "multifamily", label: "Multifamily (5+ units)" },
    { value: "condo", label: "Condo" },
    { value: "townhouse", label: "Townhouse" },
  ];

  const propertyConditions = [
    { value: "turn_key", label: "Turn-Key / Move-In Ready" },
    { value: "light_rehab", label: "Light Rehab (cosmetic)" },
    { value: "heavy_rehab", label: "Heavy Rehab (structural)" },
    { value: "tear_down", label: "Tear Down / Land Value" },
  ];

  const timelinePreferences = [
    { value: "asap", label: "ASAP (0-14 days)" },
    { value: "fast", label: "Fast (15-30 days)" },
    { value: "standard", label: "Standard (30-60 days)" },
    { value: "flexible", label: "Flexible (60+ days)" },
  ];

  const investmentStrategies = [
    { value: "buy_hold", label: "Buy & Hold Rental" },
    { value: "fix_flip", label: "Fix & Flip" },
    { value: "wholesale", label: "Wholesale" },
    { value: "brrrr", label: "BRRRR Strategy" },
    { value: "live_in_flip", label: "Live-In Flip" },
    { value: "short_term_rental", label: "Short-Term Rental (Airbnb)" },
  ];

  const selectedPropertyTypes = watch(`${prefix}property_types`) || [];
  const selectedPropertyConditions = watch(`${prefix}property_conditions`) || [];
  const selectedTimelinePreferences = watch(`${prefix}timeline_preferences`) || [];
  const selectedInvestmentStrategies = watch(`${prefix}investment_strategies`) || [];

  const handleArrayChange = (fieldName: string, value: string, checked: boolean) => {
    const currentValues = watch(fieldName) || [];
    if (checked) {
      setValue(fieldName, [...currentValues, value]);
    } else {
      setValue(fieldName, currentValues.filter((item: string) => item !== value));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Structured Buy Box Criteria</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Select specific criteria to enable automated property matching
        </p>
      </div>

      {/* Property Types */}
      <Card className="p-4">
        <Label className="text-base font-medium">Property Types</Label>
        <p className="text-sm text-muted-foreground mb-3">What types of properties does this investor buy?</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {propertyTypes.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${prefix}property_type_${type.value}`}
                checked={selectedPropertyTypes.includes(type.value)}
                onCheckedChange={(checked) => 
                  handleArrayChange(`${prefix}property_types`, type.value, checked as boolean)
                }
              />
              <Label 
                htmlFor={`${prefix}property_type_${type.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {type.label}
              </Label>
            </div>
          ))}
        </div>
      </Card>

      {/* Price Range */}
      <Card className="p-4">
        <Label className="text-base font-medium mb-3 block">Price Range</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${prefix}min_price`}>Minimum Price</Label>
            <Input
              id={`${prefix}min_price`}
              type="number"
              placeholder="50000"
              {...register(`${prefix}min_price`, { 
                valueAsNumber: true,
                min: { value: 0, message: "Price cannot be negative" }
              })}
            />
            {errors[`${prefix}min_price`] && (
              <p className="text-sm text-destructive">{errors[`${prefix}min_price`].message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${prefix}max_price`}>Maximum Price</Label>
            <Input
              id={`${prefix}max_price`}
              type="number"
              placeholder="500000"
              {...register(`${prefix}max_price`, { 
                valueAsNumber: true,
                min: { value: 0, message: "Price cannot be negative" }
              })}
            />
            {errors[`${prefix}max_price`] && (
              <p className="text-sm text-destructive">{errors[`${prefix}max_price`].message}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Square Footage */}
      <Card className="p-4">
        <Label className="text-base font-medium mb-3 block">Square Footage Range</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${prefix}min_sqft`}>Minimum Sq Ft</Label>
            <Input
              id={`${prefix}min_sqft`}
              type="number"
              placeholder="800"
              {...register(`${prefix}min_sqft`, { 
                valueAsNumber: true,
                min: { value: 0, message: "Square footage cannot be negative" }
              })}
            />
            {errors[`${prefix}min_sqft`] && (
              <p className="text-sm text-destructive">{errors[`${prefix}min_sqft`].message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${prefix}max_sqft`}>Maximum Sq Ft</Label>
            <Input
              id={`${prefix}max_sqft`}
              type="number"
              placeholder="5000"
              {...register(`${prefix}max_sqft`, { 
                valueAsNumber: true,
                min: { value: 0, message: "Square footage cannot be negative" }
              })}
            />
            {errors[`${prefix}max_sqft`] && (
              <p className="text-sm text-destructive">{errors[`${prefix}max_sqft`].message}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Year Built */}
      <Card className="p-4">
        <Label className="text-base font-medium mb-3 block">Year Built Range</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${prefix}min_year_built`}>Minimum Year Built</Label>
            <Input
              id={`${prefix}min_year_built`}
              type="number"
              placeholder="1950"
              {...register(`${prefix}min_year_built`, { 
                valueAsNumber: true,
                min: { value: 1800, message: "Year must be after 1800" },
                max: { value: new Date().getFullYear(), message: "Year cannot be in the future" }
              })}
            />
            {errors[`${prefix}min_year_built`] && (
              <p className="text-sm text-destructive">{errors[`${prefix}min_year_built`].message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${prefix}max_year_built`}>Maximum Year Built</Label>
            <Input
              id={`${prefix}max_year_built`}
              type="number"
              placeholder="2024"
              {...register(`${prefix}max_year_built`, { 
                valueAsNumber: true,
                min: { value: 1800, message: "Year must be after 1800" },
                max: { value: new Date().getFullYear(), message: "Year cannot be in the future" }
              })}
            />
            {errors[`${prefix}max_year_built`] && (
              <p className="text-sm text-destructive">{errors[`${prefix}max_year_built`].message}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Property Conditions */}
      <Card className="p-4">
        <Label className="text-base font-medium">Property Condition Preferences</Label>
        <p className="text-sm text-muted-foreground mb-3">What condition properties is this investor willing to buy?</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {propertyConditions.map((condition) => (
            <div key={condition.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${prefix}property_condition_${condition.value}`}
                checked={selectedPropertyConditions.includes(condition.value)}
                onCheckedChange={(checked) => 
                  handleArrayChange(`${prefix}property_conditions`, condition.value, checked as boolean)
                }
              />
              <Label 
                htmlFor={`${prefix}property_condition_${condition.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {condition.label}
              </Label>
            </div>
          ))}
        </div>
      </Card>

      {/* Timeline Preferences */}
      <Card className="p-4">
        <Label className="text-base font-medium">Timeline Preferences</Label>
        <p className="text-sm text-muted-foreground mb-3">How quickly can this investor close?</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {timelinePreferences.map((timeline) => (
            <div key={timeline.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${prefix}timeline_${timeline.value}`}
                checked={selectedTimelinePreferences.includes(timeline.value)}
                onCheckedChange={(checked) => 
                  handleArrayChange(`${prefix}timeline_preferences`, timeline.value, checked as boolean)
                }
              />
              <Label 
                htmlFor={`${prefix}timeline_${timeline.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {timeline.label}
              </Label>
            </div>
          ))}
        </div>
      </Card>

      {/* Investment Strategies */}
      <Card className="p-4">
        <Label className="text-base font-medium">Investment Strategies</Label>
        <p className="text-sm text-muted-foreground mb-3">What investment strategies does this investor use?</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {investmentStrategies.map((strategy) => (
            <div key={strategy.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${prefix}strategy_${strategy.value}`}
                checked={selectedInvestmentStrategies.includes(strategy.value)}
                onCheckedChange={(checked) => 
                  handleArrayChange(`${prefix}investment_strategies`, strategy.value, checked as boolean)
                }
              />
              <Label 
                htmlFor={`${prefix}strategy_${strategy.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {strategy.label}
              </Label>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};