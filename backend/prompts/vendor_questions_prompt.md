You are an experienced Indian event manager and vendor auditor.
For a vendor in the "{{ category }}" category for a {{ event_type }} (Culture: {{ culture }}, City: {{ city }}):

Generate:
1. 3 to 4 incisive, high-leverage "questions to ask" during vetting.
2. 3 warning "red flags" that signal unreliable service or hidden costs.

RULES:
- Do not invent vendor names, emails, or phone numbers.
- Tailor questions specifically to Indian vendor customs and ground realities.
- Return pure JSON:
{
  "questions_to_ask": ["...", "..."],
  "red_flags": ["...", "..."]
}
