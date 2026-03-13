# Article Schema

```json
{
  "id": "string",
  "title": "string",
  "source_name": "string",
  "source_url": "string",
  "article_url": "string",
  "published_at": "ISO-8601 string",
  "summary": "string",
  "full_excerpt_optional": "string | null",
  "category": ["string"],
  "region": ["string"],
  "issuer_type": ["Sovereign | Municipal | Corporate | Project | Multilateral | Startup"],
  "market_tags": ["string"],
  "featured": true,
  "relevance_score": 88,
  "cbgm_relevance_reason": "string",
  "image_url_optional": "string | null",
  "source_type_optional": "rss | regulator | exchange | demo",
  "fetched_at_optional": "ISO-8601 string | null"
}
```
