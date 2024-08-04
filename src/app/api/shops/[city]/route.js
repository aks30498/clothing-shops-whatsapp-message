import { NextResponse } from "next/server";
import axios from "axios";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function GET(request, { params }) {
  const { city } = params;

  if (!city) {
    return NextResponse.json({ error: "City is required" }, { status: 400 });
  }

  let counter = 1;
  const shops = [];
  let nextPageToken = null;

  while (counter === 1 || (counter < 6 && nextPageToken)) {
    try {
      const url = `https://places.googleapis.com/v1/places:searchText`;
      const response = await axios.post(
        url,
        {
          textQuery: `t-shirt printer or corporate t-shirt supplier in ${city}, India`,
          pageToken: nextPageToken || undefined,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
            "X-Goog-FieldMask":
              "places.displayName,places.nationalPhoneNumber,places.id,nextPageToken",
          },
        }
      );

      const currentShops = response.data.places;
      if (!currentShops) {
        break;
      }

      nextPageToken = response.data.nextPageToken;

      shops.push(...currentShops);
      counter = counter + 1;
    } catch (error) {
      console.error("Error fetching clothing shops:", error);
      return NextResponse.json(
        { error: "Failed to fetch shops" },
        { status: 500 }
      );
    }
  }
  return NextResponse.json(shops, { status: 200 });
}
