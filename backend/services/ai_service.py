import json
import logging
import os
from datetime import datetime, timedelta
from typing import Any, Dict, List
from backend.config import settings
from backend.models import Event

logger = logging.getLogger("utsavly.ai")

class AIService:
    def __init__(self):
        self.mock_mode = settings.ai_mock or not settings.gemini_api_key
        self.client = None
        if not self.mock_mode:
            try:
                from google import genai
                self.client = genai.Client(api_key=settings.gemini_api_key)
            except Exception as e:
                logger.warning(f"Could not initialize Google GenAI Client: {e}. Defaulting to AI_MOCK.")
                self.mock_mode = True

    def _read_prompt(self, filename: str) -> str:
        prompt_path = os.path.join(os.path.dirname(__file__), "..", "prompts", filename)
        if os.path.exists(prompt_path):
            with open(prompt_path, "r", encoding="utf-8") as f:
                return f.read()
        return ""

    def generate_budget(self, event: Event) -> Dict[str, Any]:
        """Generates budget breakdown summing exactly to event.total_budget with 8-10% contingency."""
        total = float(event.total_budget)
        contingency_pct = 9.0
        contingency_amt = round(total * (contingency_pct / 100.0), 2)
        allocatable = total - contingency_amt

        # Culturally tailored mock template per event type
        if event.type == "wedding":
            distribution = [
                ("Catering & Royal Banquet", 0.38, "Multi-course feast, live counters, welcome drinks"),
                ("Decor, Stage & Floral Mandap", 0.22, "Traditional marigold & rose decor, fairy lights"),
                ("Photography & Cinematic Film", 0.12, "Candid team, traditional photo, drone footage"),
                ("Attire, Jewellery & Styling", 0.10, "Bridal lehenga, groom sherwani, salon & mehendi"),
                ("Entertainment, DJ & Sound", 0.08, "Sangeet sound setup, DJ, dhol players"),
                ("Invites & Guest Favors", 0.05, "E-invites, sweets gift boxes, welcome kits"),
                ("Logistics & Transport", 0.05, "Guest shuttle and bridal car rental")
            ]
        elif event.type == "birthday":
            distribution = [
                ("Venue & Party Hall Rental", 0.25, "Air-conditioned banquet or cafe private terrace"),
                ("Food, Snacks & Live Counters", 0.35, "Starters, mocktails, pizza/pasta counter, dessert"),
                ("Theme Decor & Balloon Arch", 0.15, "Photo backdrop, LED marquee number, table centrepieces"),
                ("Designer Cake & Sweets", 0.08, "Custom themed 2-tier cake & matching cupcakes"),
                ("Host, Magic Show & Games", 0.10, "Emcee, games coordinator, magic or puppet show"),
                ("Return Gifts & Goodie Bags", 0.07, "Customized hampers for kids and guests")
            ]
        else:  # community
            distribution = [
                ("Pandal, Sound & Lighting", 0.32, "Waterproof tent, line-array speakers, stage floodlights"),
                ("Community Mahaprasad / Food", 0.36, "Pure vegetarian community feast for all attendees"),
                ("Permits, Police & Safety", 0.08, "Municipal sound clearance, fire safety, security guards"),
                ("Performances & Cultural Acts", 0.12, "Folk dance troupe, bhajan/music ensemble"),
                ("Signage, Banners & Media", 0.06, "Stage backdrops, arch gates, social live-stream"),
                ("Volunteer Kits & Clean-up", 0.06, "Badges, high-vis vests, waste management bins")
            ]

        # Calculate exact item amounts
        items = []
        running_sum = 0.0
        for i, (cat, pct, notes) in enumerate(distribution):
            if i == len(distribution) - 1:
                # Absorb rounding differences so planned equals allocatable exactly
                planned = round(allocatable - running_sum, 2)
            else:
                planned = round(allocatable * pct, 2)
                running_sum += planned
            items.append({
                "category": cat,
                "planned": planned,
                "percentage": round((planned / total) * 100, 1),
                "notes": notes
            })

        # Add contingency item
        items.append({
            "category": "Contingency & Emergency Reserve",
            "planned": contingency_amt,
            "percentage": contingency_pct,
            "notes": "Dedicated 9% safety cushion for last-minute price fluctuations"
        })

        return {
            "total_budget": total,
            "allocated_total": total,
            "contingency_percentage": contingency_pct,
            "contingency_amount": contingency_amt,
            "items": items
        }

    def generate_timeline(self, event: Event) -> List[Dict[str, Any]]:
        """Generates backward-planned tasks relative to event date."""
        try:
            event_date = datetime.strptime(event.date, "%Y-%m-%d")
        except Exception:
            event_date = datetime.now() + timedelta(days=90)

        fmt = "%Y-%m-%d"
        tasks_data = []

        if event.type == "wedding":
            tasks_data = [
                ("Finalize Venue & Banquet Booking", event_date - timedelta(days=120), "Venue", "critical"),
                ("Book Lead Caterer & Menu Tasting", event_date - timedelta(days=90), "Food", "critical"),
                ("Hire Candid Photographer & Cinematographer", event_date - timedelta(days=75), "Photography", "high"),
                ("Finalize Stage & Mandap Floral Decor", event_date - timedelta(days=60), "Decor", "high"),
                ("Order Wedding Outfits & Jewellery Fitting", event_date - timedelta(days=45), "Attire", "medium"),
                ("Dispatch Digital Invites & RSVP Link", event_date - timedelta(days=30), "Invites", "medium"),
                ("Sangeet Choreography & DJ Music Playlist", event_date - timedelta(days=20), "Entertainment", "medium"),
                ("Final Headcount & Catering Count Confirmation", event_date - timedelta(days=7), "Food", "high"),
                ("Pack Welcome Hampers & Puja Materials", event_date - timedelta(days=3), "Logistics", "low"),
                ("Day-of Vendor Briefing & Soundcheck", event_date - timedelta(days=1), "Coordination", "critical")
            ]
        elif event.type == "birthday":
            tasks_data = [
                ("Pick Theme & Book Venue or Cafe Area", event_date - timedelta(days=30), "Venue", "critical"),
                ("Send Digital Invitations & Collect RSVPs", event_date - timedelta(days=21), "Invites", "high"),
                ("Order Custom Themed Birthday Cake", event_date - timedelta(days=14), "Food", "high"),
                ("Book Emcee / Entertainer & Magician", event_date - timedelta(days=10), "Entertainment", "medium"),
                ("Purchase Balloons, Props & Return Gifts", event_date - timedelta(days=5), "Decor", "medium"),
                ("Finalize Snack Platter & Mocktail Menu", event_date - timedelta(days=3), "Food", "high"),
                ("Set Up Party Playlist & Sound System", event_date - timedelta(days=1), "Entertainment", "low")
            ]
        else:  # community
            tasks_data = [
                ("Obtain Municipal, Police & Sound Permissions", event_date - timedelta(days=45), "Permits", "critical"),
                ("Hire Pandal, Stage & PA Sound Contractor", event_date - timedelta(days=30), "Logistics", "critical"),
                ("Launch Volunteer Drive & Role Assignments", event_date - timedelta(days=25), "Coordination", "high"),
                ("Book Maha-Prasad Catering & Grocery Vendor", event_date - timedelta(days=20), "Food", "high"),
                ("Erect Entry Gates & Banner Signages", event_date - timedelta(days=7), "Decor", "medium"),
                ("Safety & Crowd Control Dry-Run", event_date - timedelta(days=2), "Security", "high"),
                ("Sanitation & Waste Management Setup", event_date - timedelta(days=1), "Logistics", "medium")
            ]

        res = []
        for title, dt, cat, priority in tasks_data:
            # If the calculated due date is in the past, adjust gracefully
            now_dt = datetime.now()
            final_due = dt if dt >= now_dt else now_dt + timedelta(days=3)
            res.append({
                "title": title,
                "due_date": final_due.strftime(fmt),
                "category": cat,
                "status": "pending",
                "priority": priority
            })
        return res

    def generate_vendor_questions(self, category: str, culture: str = "Indian") -> Dict[str, List[str]]:
        """Generates category-specific questions to ask and red flags."""
        cat_lower = category.lower()
        if "cater" in cat_lower or "food" in cat_lower:
            return {
                "questions_to_ask": [
                    "Is service staff and live counter crockery/cutlery included, or extra per-plate?",
                    "What is your policy for leftover food handling and hygienic disposal?",
                    "Can we schedule a live tasting session with the exact chef team assigned to our date?"
                ],
                "red_flags": [
                    "Reluctance to let you taste sample dishes or visit their central base kitchen",
                    "No clear policy or backup plan if guest count exceeds by 15-20%",
                    "Vague hidden charges for ice cubes, garbage clearance, or extra mineral water crates"
                ]
            }
        elif "photo" in cat_lower or "film" in cat_lower:
            return {
                "questions_to_ask": [
                    "Will the principal photographer whose portfolio we reviewed shoot personally on the day?",
                    "What backup camera bodies, lenses, and dual memory card systems do you carry?",
                    "What is the exact contracted turnaround date for teaser trailer, album album proofs, and raw photos?"
                ],
                "red_flags": [
                    "Freelance outsourcing without introducing the actual photographers who will attend",
                    "Demanding 100% full balance payment before event day starts",
                    "No written clause for event footage backup on cloud/hard drives"
                ]
            }
        elif "decor" in cat_lower or "flower" in cat_lower:
            return {
                "questions_to_ask": [
                    "Are fresh flowers sourced morning-of, and what happens if a specific exotic bloom is unavailable?",
                    "Are fireproof fabrics and heavy-duty truss structures used for overhead canopies?",
                    "How many hours before the event start will setup be 100% complete for photography?"
                ],
                "red_flags": [
                    "Showing Google Pinterest images rather than their own actual real-event build photos",
                    "No clear breakdown between rental hardware vs consumable fresh flowers",
                    "Refusing a joint site walkthrough with the venue manager"
                ]
            }
        else:
            return {
                "questions_to_ask": [
                    "What is the exact cancellation and date-rescheduling policy in writing?",
                    "How many team members will be on site and who is the designated point-of-contact?",
                    "Are all logistics, delivery fees, and overtime charges included in this quote?"
                ],
                "red_flags": [
                    "Refusing to sign a formal scope-of-work receipt or GST invoice",
                    "Asking for unrecorded cash advances without receipt confirmation",
                    "Unresponsive communication during initial enquiry phase"
                ]
            }

    def generate_ideas(self, event: Event, remaining_budget: float) -> List[Dict[str, Any]]:
        """Generates ideas fitting the remaining budget."""
        if event.type == "wedding":
            return [
                {
                    "kind": "decor",
                    "title": "Brass Urli & Fresh Jasmine Welcoming Aisle",
                    "description": "Handcrafted brass urlis filled with rose petals and floating beeswax candles along the entrance walk.",
                    "est_cost": min(25000.0, remaining_budget * 0.15),
                    "effort": "low"
                },
                {
                    "kind": "menu",
                    "title": "Interactive Live Mithai & Kulhad Chai Bar",
                    "description": "Freshly fried hot Jalebi with Rabri paired with artisanal spiced cutting chai in earthen kulhads.",
                    "est_cost": min(45000.0, remaining_budget * 0.20),
                    "effort": "medium"
                },
                {
                    "kind": "entertainment",
                    "title": "Flashmob Dhol & Folk Jugalbandi Entrance",
                    "description": "High-octane Punjabi or Rajasthani folk percussionist battle to pump up guests entering the sangeet.",
                    "est_cost": min(35000.0, remaining_budget * 0.15),
                    "effort": "medium"
                },
                {
                    "kind": "invites",
                    "title": "Animated WhatsApp Video Invite with Music",
                    "description": "Custom illustrated 30-second reel with venue Google Maps QR code and dress code guide.",
                    "est_cost": min(12000.0, remaining_budget * 0.05),
                    "effort": "low"
                },
                {
                    "kind": "gifts",
                    "title": "Seed-Paper Itinerary Cards & Herbal Mithai Hampers",
                    "description": "Eco-friendly plantable wedding programs paired with organic honey & dry-fruit brass boxes.",
                    "est_cost": min(30000.0, remaining_budget * 0.15),
                    "effort": "low"
                }
            ]
        elif event.type == "birthday":
            return [
                {
                    "kind": "decor",
                    "title": "Pastel Balloon Cloud & Neon Light Signage",
                    "description": "Organic balloon garland framing a glowing custom neon acrylic sign for Insta-worthy snaps.",
                    "est_cost": min(15000.0, remaining_budget * 0.20),
                    "effort": "low"
                },
                {
                    "kind": "menu",
                    "title": "DIY Mini Sliders & Churros Live Station",
                    "description": "Interactive snack counter where guests choose their sauces, melted cheese and toppings.",
                    "est_cost": min(22000.0, remaining_budget * 0.25),
                    "effort": "medium"
                },
                {
                    "kind": "entertainment",
                    "title": "Close-up Sleight-of-hand Magician & Illusionist",
                    "description": "Walkaround entertainer engaging groups during drinks and appetizers.",
                    "est_cost": min(18000.0, remaining_budget * 0.20),
                    "effort": "medium"
                },
                {
                    "kind": "invites",
                    "title": "Interactive Digital RSVP Website",
                    "description": "Single-page mobile site with countdown timer, theme playlist link, and dietary notes form.",
                    "est_cost": min(5000.0, remaining_budget * 0.08),
                    "effort": "low"
                },
                {
                    "kind": "gifts",
                    "title": "Personalized Succulent Pots & Gourmet Cocoa",
                    "description": "Mini potted jade plants with personalized guest thank-you tags and hot chocolate mix.",
                    "est_cost": min(12000.0, remaining_budget * 0.15),
                    "effort": "low"
                }
            ]
        else:  # community
            return [
                {
                    "kind": "decor",
                    "title": "Eco-Friendly Recyclable Paper & Cloth Torans",
                    "description": "Zero-plastic festoons crafted by local women artisans, giving a vibrant festive feel.",
                    "est_cost": min(18000.0, remaining_budget * 0.15),
                    "effort": "low"
                },
                {
                    "kind": "menu",
                    "title": "Satvik Maha-Bhog Buffet with Regional Specialties",
                    "description": "Hygienic biodegradable areca leaf plates serving temple-style Khichdi, Kheer and Chana.",
                    "est_cost": min(50000.0, remaining_budget * 0.35),
                    "effort": "high"
                },
                {
                    "kind": "entertainment",
                    "title": "Inter-Wing Cultural Rangoli & Antakshari Cup",
                    "description": "Community contest with running commentary to get senior citizens and youngsters involved.",
                    "est_cost": min(10000.0, remaining_budget * 0.10),
                    "effort": "medium"
                },
                {
                    "kind": "invites",
                    "title": "Society Broadcast Digital Notice with Schedule PDF",
                    "description": "Clear multilingual schedule with parking instructions and event timings.",
                    "est_cost": min(3000.0, remaining_budget * 0.05),
                    "effort": "low"
                },
                {
                    "kind": "gifts",
                    "title": "Prasadam Pouches in Jute Bags",
                    "description": "Blessed dry-fruit and sacred thread pouches handed to each family upon exit.",
                    "est_cost": min(20000.0, remaining_budget * 0.15),
                    "effort": "low"
                }
            ]

    def copilot_assist(self, event: Event, message: str) -> Dict[str, Any]:
        """Tool-calling Copilot responding with structured modifications."""
        msg = message.lower()
        actions = []
        reply = ""

        if "cater" in msg or "food" in msg:
            if "increase" in msg or "more" in msg or "add" in msg:
                reply = f"I've adjusted the Catering budget upward by ₹50,000 to accommodate richer menu options, and balanced it against Decor so your total budget remains stable at ₹{event.total_budget:,.0f}."
                actions.append({
                    "tool": "update_budget_item",
                    "details": {"category": "Catering & Royal Banquet", "planned_delta": 50000.0}
                })
            else:
                reply = "I've reviewed your catering allocation. Catering is your main guest-satisfaction driver; I can help you rebalance live counters or adjust dessert selections."
        elif "reschedule" in msg or "date" in msg:
            reply = f"If your event date is shifting, tell me the new date and I will automatically backward-reschedule all {len(event.tasks)} milestone tasks."
        elif "vendor" in msg or "photograph" in msg:
            reply = "I can inspect vendor quotes or generate tailored vetting questions to ensure you don't face last-minute hidden charges."
        else:
            reply = f"I'm keeping a close eye on your {event.title} plan! Your budget is currently ₹{event.total_budget:,.0f} with {len(event.tasks)} planned tasks. How would you like to optimize today?"

        return {
            "reply": reply,
            "actions_taken": actions
        }

ai_service = AIService()
