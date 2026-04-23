# MCP Itachi Installation Guide

This guide explains how to install and configure the mcp-itachi server using Claude MCP.

---

## Prerequisites

- Claude CLI installed  
- Access to terminal / command line  
- Internet connection  

---

## Steps

### 1. Navigate to Your Project Folder

cd [folder]

Replace [folder] with your target directory.

---

### 2. Add MCP Server

claude mcp add mcp-itachi --transport sse https://mcp-itachi-minimal-maksimal-production.up.railway.app/sse

---

## Configuration Details

- Name: mcp-itachi  
- Transport: sse (Server-Sent Events)  
- Endpoint: https://mcp-itachi-minimal-maksimal-production.up.railway.app/sse  

---

## Verification

claude mcp list

You should see mcp-itachi in the list.

---

## Notes

- Ensure the endpoint is accessible  
- If the server is down, the MCP will not function properly  

To remove the MCP:

claude mcp remove mcp-itachi  

---

## Troubleshooting

- Connection issues: check if the endpoint URL is reachable  
- Command not found: ensure Claude CLI is properly installed and available in your PATH  

---

## Author
Itachi
