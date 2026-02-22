#!/bin/bash

# MCP Integration Setup Script
# Run this to generate .env file with MCP credentials

set -e

CONFIG_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$CONFIG_DIR"

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    touch .env
fi

# Function to get user input and add to .env
add_to_env() {
    local var_name=$1
    local prompt=$2

    echo -n "$prompt: "
    read -r value

    if [ -n "$value" ]; then
        echo "${var_name}=${value}" >> .env
        echo "✓ Added ${var_name}"
    else
        echo "✗ Skipped ${var_name} (empty)"
    fi
}

echo "🦞 MCP Integration Setup"
echo "========================"
echo ""
echo "This will add credentials to .env file"
echo ""

# Notion
echo "🔐 Notion MCP"
add_to_env "NOTION_MCP_TOKEN" "Enter Notion Internal Integration Token"
add_to_env "NOTION_SERVER_URL" "Enter Notion server URL (https://mcp.notion.com/mcp)"

# Slack
echo ""
echo "🔐 Slack MCP"
add_to_env "SLACK_MCP_TOKEN" "Enter Slack Bot Token (xoxb-...)"
add_to_env "SLACK_SERVER_URL" "Enter Slack server URL (https://mcp.slack.com/mcp)"

# Atlassian
echo ""
echo "🔐 Atlassian MCP"
add_to_env "ATLASSIAN_MCP_TOKEN" "Enter Atlassian API Token"
add_to_env "ATLASSIAN_SERVER_URL" "Enter Atlassian server URL (https://mcp.atlassian.com/v1/mcp)"
add_to_env "ATLASSIAN_ACCOUNT_ID" "Enter your Atlassian Account ID"

# Miro
echo ""
echo "🔐 Miro MCP"
add_to_env "MIRO_MCP_TOKEN" "Enter Miro API Token"
add_to_env "MIRO_SERVER_URL" "Enter Miro server URL (https://developers.miro.com/docs/miro-mcp)"
add_to_env "MIRO_TEAM_ID" "Enter Miro Team ID (optional)"

# Vercel
echo ""
echo "🔐 Vercel MCP"
add_to_env "VERCEL_MCP_TOKEN" "Enter Vercel API Token"
add_to_env "VERCEL_SERVER_URL" "Enter Vercel server URL"
add_to_env "VERCEL_TEAM_ID" "Enter Vercel Team ID (optional)"

# Supabase
echo ""
echo "🔐 Supabase MCP"
add_to_env "SUPABASE_PROJECT_URL" "Enter Supabase Project URL"
add_to_env "SUPABASE_MCP_API_KEY" "Enter Supabase Service Role Key"
add_to_env "SUPABASE_SERVER_URL" "Enter Supabase server URL (https://mcp.supabase.com/mcp)"

echo ""
echo "✓ MCP setup complete!"
echo ""
echo "Next steps:"
echo "1. Restart OpenClaw gateway: openclaw gateway restart"
echo "2. Test connections with the guide in MCP_SETUP.md"
echo "3. Make sure .env is in your .gitignore"