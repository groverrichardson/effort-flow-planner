#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve Supabase URL and Anon Key from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        'SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required'
    );
    process.exit(1);
}

class SupabaseMCPServer {
    private server: Server;
    private supabase: SupabaseClient;

    constructor() {
        this.server = new Server(
            {
                name: 'supabase-mcp-server',
                version: '0.1.0',
                description: 'An MCP server to interact with Supabase',
            },
            {
                capabilities: {
                    tools: {}, // Tools will be dynamically listed
                },
            }
        );

        try {
            this.supabase = createClient(supabaseUrl!, supabaseAnonKey!);
        } catch (error) {
            console.error('Failed to create Supabase client:', error);
            process.exit(1);
        }

        this.setupToolHandlers();

        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }

    private setupToolHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'listSupabaseTables',
                    description:
                        'Lists all tables in the public schema of the Supabase project.',
                    inputSchema: {
                        type: 'object',
                        properties: {}, // No input parameters for this simple tool
                    },
                },
                // Future tools can be added here, e.g., queryTable, insertData
            ],
        }));

        // Handle tool calls
        this.server.setRequestHandler(
            CallToolRequestSchema,
            async (request) => {
                if (request.params.name === 'listSupabaseTables') {
                    try {
                        // Supabase stores table information in `pg_catalog.pg_tables`
                        // We query this and filter for the 'public' schema.
                        const { data, error } = await this.supabase
                            .from('pg_catalog.pg_tables')
                            .select('tablename')
                            .eq('schemaname', 'public');

                        if (error) {
                            throw new McpError(
                                ErrorCode.InternalError,
                                `Supabase error: ${error.message}`
                            );
                        }

                        const tableNames = data
                            ? data.map((table: any) => table.tablename)
                            : [];
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(tableNames, null, 2),
                                },
                            ],
                        };
                    } catch (e: any) {
                        const errorMessage =
                            e instanceof McpError
                                ? e.message
                                : e.message || 'An unknown error occurred';
                        console.error(
                            `Error in listSupabaseTables: ${errorMessage}`
                        );
                        throw new McpError(
                            ErrorCode.InternalError,
                            `Failed to list Supabase tables: ${errorMessage}`
                        );
                    }
                } else {
                    throw new McpError(
                        ErrorCode.MethodNotFound,
                        `Unknown tool: ${request.params.name}`
                    );
                }
            }
        );
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error(
            'Supabase MCP server running on stdio. Waiting for SUPABASE_URL and SUPABASE_ANON_KEY.'
        );
    }
}

// Only run the server if Supabase URL and Key are present (they are checked at the top)
// The console.error in run() will indicate it's waiting if they were somehow missed by the top check
// but the process will exit if they are not set due to the check at the beginning.
const serverInstance = new SupabaseMCPServer();
serverInstance.run().catch((error) => {
    console.error('Failed to run Supabase MCP server:', error);
    process.exit(1);
});
