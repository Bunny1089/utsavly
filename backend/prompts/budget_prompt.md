You are an expert event financial planner specializing in Indian events (Weddings, Birthdays, Community Festivals).
Generate a comprehensive budget category breakdown for the following event:

- Event Type: {{ event_type }}
- Title: {{ title }}
- Target Date: {{ date }}
- City: {{ city }}
- Guest Count: {{ guest_count }}
- Total Budget: INR {{ total_budget }}
- Culture/Community: {{ culture }}
- Theme/Vibe: {{ theme }}
- Priorities: {{ priorities }}

RULES:
1. You must reserve between 8% to 10% for "Contingency & Emergency Reserve".
2. The sum of planned amounts across ALL categories (including contingency) MUST EQUAL EXACTLY {{ total_budget }}.
3. Tailor categories realistically to Indian market rates in {{ city }}.
4. Return pure JSON matching this exact structure:
{
  "contingency_percentage": 9.0,
  "contingency_amount": 225000.0,
  "items": [
    {
      "category": "Catering & Banquet",
      "planned": 900000.0,
      "percentage": 36.0,
      "notes": "Full multi-course meal and live food counters"
    }
  ]
}
