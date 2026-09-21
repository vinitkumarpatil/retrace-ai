# ReTrace Chrome Extension

A Manifest V3 Chrome extension for capturing browser context and sending it to ReTrace for context reconstruction.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `extension/` directory from this project
5. The ReTrace icon will appear in your browser toolbar

## Usage

1. Navigate to any web page you want to capture
2. Click the ReTrace extension icon
3. The popup will show:
   - Page title and URL
   - Readable content preview
   - Project selector
4. Click **Save Context** to ingest the page into ReTrace
5. Click **Save + Ask** to save and open the ReTrace dashboard with a query

## Features

- **Page Content Extraction**: Automatically extracts readable content from web pages
- **Project Organization**: Assign captured pages to projects
- **Duplicate Detection**: Content hashing prevents re-ingesting the same page
- **Direct Integration**: Communicates with the ReTrace backend API

## Configuration

The extension connects to `http://localhost:8000` by default. To change this, edit the `API_URL` constant in `popup.js`.

## Permissions

- `activeTab`: Access the current tab's content
- `scripting`: Inject content scripts for page extraction
- `storage`: Store extension settings
- `host_permissions`: Communicate with the ReTrace backend

## Privacy

- Only captures content when you explicitly click Save
- Does not silently collect browsing history
- Content is sent directly to your local ReTrace instance
