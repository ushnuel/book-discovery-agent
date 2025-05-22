# Book Discovery Agent

A TypeScript-based automation agent that scrapes book data from BookDP.com.au, enriches it with AI, calculates cost information, and sends the results to a productivity tool via Make.com.

## Features

- Web scraping of BookDP.com.au using Playwright
- AI-powered book summary and relevance scoring using OpenAI
- Cost analysis and value scoring
- RESTful API for job management
- Integration with Make.com for productivity tool automation
- Docker containerization

## Architecture and Approach

### Scraping Strategy

The system uses a hybrid approach to data extraction:

1. **Primary Data Source (JSON-LD)**

   - Utilizes structured data from JSON-LD scripts embedded in the page
   - Provides reliable, machine-readable data about books
   - Includes basic information like title, author, and price

2. **Fallback HTML Scraping**
   - Extracts additional data from HTML elements when JSON-LD is incomplete
   - Targets specific elements:
     - Original prices from `<del>` elements
     - Detailed descriptions from `.woocommerce-tabs--description-content`
   - Ensures comprehensive data collection even when structured data is limited

### Browser Management

- Uses Playwright for browser automation
- Implements efficient page management:
  - Main page for browsing search results
  - Individual pages for each product
  - Automatic page cleanup after scraping
- Handles pagination and navigation systematically

### Data Processing Pipeline

1. **Initial Scraping**

   - Searches for books based on theme
   - Extracts basic information from search results
   - Collects product URLs for detailed scraping

2. **Detailed Data Collection**

   - Visits each product page
   - Combines data from multiple sources
   - Validates and processes the collected information

3. **Data Enrichment**
   - AI-powered summary generation
   - Relevance scoring
   - Value calculation based on price and relevance

### Error Handling and Resilience

- Graceful handling of missing data
- Fallback mechanisms for different data sources
- Comprehensive error logging
- Continues processing even if individual products fail

### Performance Considerations

- Efficient resource management
- Automatic cleanup of browser resources
- Optimized selectors for reliable data extraction

## Prerequisites

- Node.js 18 or later
- Docker (for containerized deployment)
- OpenAI API key
- Make.com webhook URL

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd book-discovery-agent
```

2. Install dependencies:

```bash
npm install
```

3. Install Playwright and its dependencies:

```bash
# Install Playwright Chromium browser
npx playwright install chromium

# Install system dependencies (if needed)
npx playwright install-deps
```

4. Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
OPENAI_API_KEY=your_openai_api_key
MAKE_WEBHOOK_URL=your_make_webhook_url
BOOKDP_BASE_URL=https://www.bookdp.com.au
```

5. Build the project:

```bash
npm run build
```

## Running the Application

### Local Development

```bash
npm run dev
```

### Production

```bash
npm start
```

### Docker

```bash
docker build -t book-discovery-agent .
docker run --env-file .env -p 3000:3000 book-discovery-agent
```

## API Endpoints

### POST /scrape

Start a new book scraping job.

Request body:

```json
{
  "theme": "climate change"
}
```

Response:

```json
{
  "message": "Book scraping job created successfully",
  "data": {
    "status": "pending",
    "jobId": "uuid"
  }
}
```

### GET /status/:jobId

Get the status of a scraping job.

Response:

```json
{
    "data": {
        "id": "4a752c76-8740-414b-b52a-117bc0db785b",
        "status": "completed",
        "createdAt": "2025-05-21T16:45:15.878Z",
        "updatedAt": "2025-05-21T16:46:29.757Z",
        "books": [...],
    }
}
```

### GET /results/:jobId

Get the results of a completed scraping job.

Response:

```json
{
  "data": {
    "status": "completed",
    "books": [
      {
        "title": "Book Title",
        "author": "Author Name",
        "currentPrice": 29.99,
        "originalPrice": 39.99,
        "description": "Book description...",
        "productUrl": "https://...",
        "aiSummary": "AI-generated summary...",
        "relevanceScore": 85,
        "discountAmount": 10.0,
        "discountPercentage": 25,
        "valueScore": 2.83
      }
    ]
  }
}
```

## Make.com Integration

1. Create a new scenario in Make.com
2. Add a Webhook trigger
3. Configure the webhook to receive data from the Book Discovery Agent
4. Add a Google Sheets action to store the results
5. Save and activate the scenario

## Project Deliverables

### Make.com Scenario Configuration

![Scenario Configuration one](/assets/screenshots/scenario-config1.PNG)

![Scenario Configuration two](/assets/screenshots/scenario-config2.PNG)

![Scenario Configuration three](/assets/screenshots/scenario-config3.PNG)

### Scraped Output Sample

![Scraped Output Sample](/assets/screenshots/scraped-output.PNG)

### AI Summaries and Scores

![AI Summaries and Scores](/assets/screenshots/ai-summaries-scores.PNG)
