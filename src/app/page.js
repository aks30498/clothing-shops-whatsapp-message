"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCallback, useState } from "react";

function Home() {
  const [cityName, setCityName] = useState("");
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSearchButtonClick = useCallback(async () => {
    if (!cityName.trim()) {
      alert("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/shops/${encodeURIComponent(cityName.trim())}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch shops.");
      }
      const data = await response.json();
      setShops(
        data
          .filter((d) => d.nationalPhoneNumber)
          .map((d) => ({ ...d, selected: true }))
      );
    } catch (err) {
      console.error("Error fetching shops:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [cityName]);

  const onCheckboxChange = (shopId) => {
    setShops((s) =>
      s.map((shop) =>
        shop.id === shopId ? { ...shop, selected: !shop.selected } : shop
      )
    );
  };

  const onDownloadCSV = () => {
    const selectedShops = shops.filter((s) => s.selected);

    const csvRows = selectedShops.map((row) => {
      const name = row.displayName.text.replace(/"/g, '""');
      const phoneNumber = ("" + row.nationalPhoneNumber).replace(/"/g, '""');
      return `"${name}","${phoneNumber}"`;
    });

    // Create the CSV file content
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex items-center min-h-full">
      <div className="w-full">
        <h1 className="font-semibold mb-10 text-center text-3xl">
          Bliss-Wear Whatsapp Promotion Tool
        </h1>
        <div className="w-full">
          <div className="flex items-center mb-6">
            <Input
              type="text"
              placeholder="Enter city name"
              className="flex-1 mr-4 h-10 rounded-md border-gray-300 focus:border-primary focus:ring-primary"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
            />
            <Button
              onClick={onSearchButtonClick}
              className="h-10 rounded-md bg-primary text-primary-foreground"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>

          {shops.length > 0 && (
            <div className="bg-background border border-muted rounded-md p-6">
              <div className="flex justify-between">
                <h2 className="text-xl font-semibold mb-4">Select Shops</h2>
                <Button
                  onClick={onDownloadCSV}
                  className="bg-primary text-primary-foreground"
                >
                  Download CSV
                </Button>
              </div>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {shops.map((shop, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-muted/20 rounded-md p-4"
                  >
                    <Checkbox
                      onCheckedChange={() => onCheckboxChange(shop.id)}
                      defaultChecked
                      className="mr-4"
                    />
                    <div>
                      <h3 className="font-medium">{shop.displayName.text}</h3>
                      <p className="text-muted-foreground">
                        {shop.nationalPhoneNumber}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
