import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { importInvestorsToDatabase, rawInvestorData } from "@/utils/investorDataImporter";
import { Loader2, Upload, CheckCircle, AlertCircle, Users, Building } from "lucide-react";

export const InvestorDataImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const { toast } = useToast();

  const handleImport = async () => {
    setIsImporting(true);
    setImportStatus('idle');
    
    try {
      const result = await importInvestorsToDatabase();
      
      if (result.success) {
        setImportStatus('success');
        setImportMessage(result.message);
        toast({
          title: "Import Successful",
          description: "Investor data has been imported successfully!",
        });
      } else {
        setImportStatus('error');
        setImportMessage(result.message);
        toast({
          title: "Import Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setImportStatus('error');
      setImportMessage('An unexpected error occurred during import.');
      toast({
        title: "Import Failed", 
        description: "An unexpected error occurred during import.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const getStatusIcon = () => {
    switch (importStatus) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (importStatus) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return '';
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Import Investor Data
        </CardTitle>
        <CardDescription>
          Import investor data from the AMP Clever Offers spreadsheet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{rawInvestorData.length} investors ready</span>
          </div>
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span>Coverage areas included</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <span>Buy box criteria</span>
          </div>
        </div>

        {importStatus !== 'idle' && (
          <Alert className={getStatusColor()}>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <AlertDescription>{importMessage}</AlertDescription>
            </div>
          </Alert>
        )}

        <div className="space-y-3">
          <h4 className="font-medium">Investors to be imported:</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {rawInvestorData.map((investor, index) => (
              <div key={index} className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded">
                <span className="font-medium">{investor.companyName}</span>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>Tier {investor.tier}</span>
                  <span>•</span>
                  <span>{investor.coverageType}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleImport} 
          disabled={isImporting || importStatus === 'success'}
          className="w-full"
        >
          {isImporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : importStatus === 'success' ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Import Complete
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Import Investor Data
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};