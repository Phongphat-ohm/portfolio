"use client";
import { useEffect, useState } from "react";

export default function Home() {
    const [selectedDb, setSelectedDb] = useState("mysql");
    const [host, setHost] = useState("localhost");
    const [port, setPort] = useState("3306");
    const [database, setDatabase] = useState("myapp");
    const [username, setUsername] = useState("root");
    const [password, setPassword] = useState("");
    const [ssl, setSsl] = useState(false);

    const [connectionString, setConnectionString] = useState("");
    const [envVariables, setEnvVariables] = useState("");
    const [nextjsExample, setNextjsExample] = useState("");

    const dbConfigs: Record<
        string,
        { port: string; template: string; envPrefix: string }
    > = {
        mysql: {
            port: "3306",
            template: "mysql://{{username}}:{{password}}@{{host}}:{{port}}/{{database}}{{ssl}}",
            envPrefix: "MYSQL",
        },
        postgresql: {
            port: "5432",
            template: "postgresql://{{username}}:{{password}}@{{host}}:{{port}}/{{database}}{{ssl}}",
            envPrefix: "POSTGRES",
        },
        mongodb: {
            port: "27017",
            template: "mongodb://{{username}}:{{password}}@{{host}}:{{port}}/{{database}}{{ssl}}",
            envPrefix: "MONGODB",
        },
        sqlserver: {
            port: "1433",
            template: "sqlserver://{{username}}:{{password}}@{{host}}:{{port}};database={{database}}{{ssl}}",
            envPrefix: "SQLSERVER",
        },
    };

    const generateConnectionString = () => {
        let template = dbConfigs[selectedDb].template;
        let sslParam = "";

        if (ssl) {
            if (selectedDb === "mysql") sslParam = "?ssl=true";
            else if (selectedDb === "postgresql") sslParam = "?sslmode=require";
            else if (selectedDb === "mongodb") sslParam = "?ssl=true";
            else if (selectedDb === "sqlserver") sslParam = ";encrypt=true";
        }

        const connStr = template
            .replace("{{username}}", encodeURIComponent(username))
            .replace("{{password}}", encodeURIComponent(password))
            .replace("{{host}}", host)
            .replace("{{port}}", port)
            .replace("{{database}}", database)
            .replace("{{ssl}}", sslParam);

        setConnectionString(connStr);

        const envVars = `DATABASE_URL="${connStr}"
DB_HOST="${host}"
DB_PORT="${port}"
DB_NAME="${database}"
DB_USER="${username}"
DB_PASSWORD="${password}"`;

        setEnvVariables(envVars);

        const example = `// lib/db.js
import { ${selectedDb === "mysql"
                ? "createConnection"
                : selectedDb === "postgresql"
                    ? "Client"
                    : selectedDb === "mongodb"
                        ? "MongoClient"
                        : "ConnectionPool"
            } } from '${selectedDb === "mysql"
                ? "mysql2"
                : selectedDb === "postgresql"
                    ? "pg"
                    : selectedDb === "mongodb"
                        ? "mongodb"
                        : "mssql"
            }';

const connectionString = process.env.DATABASE_URL;

${selectedDb === "mysql"
                ? `const connection = createConnection(connectionString);`
                : selectedDb === "postgresql"
                    ? `const client = new Client({ connectionString });`
                    : selectedDb === "mongodb"
                        ? `const client = new MongoClient(connectionString);`
                        : `const pool = new ConnectionPool(connectionString);`
            }

export default ${selectedDb === "mongodb"
                ? "client"
                : selectedDb === "sqlserver"
                    ? "pool"
                    : selectedDb === "postgresql"
                        ? "client"
                        : "connection"
            };`;

        setNextjsExample(example);
    };

    useEffect(() => {
        generateConnectionString();
    }, [selectedDb, host, port, database, username, password, ssl]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Database Connection String Generator
                    </h1>
                    <p className="text-gray-600">
                        สร้าง Connection String สำหรับฐานข้อมูลต่างๆ อย่างง่ายดาย
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        {/* Database Type Selection */}
                        <div className="mb-8">
                            <label className="block text-sm font-semibold text-gray-700 mb-4">
                                เลือกประเภทฐานข้อมูล
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {["mysql", "postgresql", "mongodb", "sqlserver"].map((db) => (
                                    <button
                                        key={db}
                                        onClick={() => {
                                            setSelectedDb(db);
                                            setPort(dbConfigs[db].port);
                                        }}
                                        className={`db-btn ${db === "mysql"
                                            ? "bg-orange-500 hover:bg-orange-600"
                                            : db === "postgresql"
                                                ? "bg-blue-500 hover:bg-blue-600"
                                                : db === "mongodb"
                                                    ? "bg-green-500 hover:bg-green-600"
                                                    : "bg-red-500 hover:bg-red-600"
                                            } ${selectedDb === db ? "ring-4 ring-opacity-50" : ""
                                            } text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105`}
                                    >
                                        {db.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Connection Form */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                    ข้อมูลการเชื่อมต่อ
                                </h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Host/Server
                                    </label>
                                    <input
                                        type="text"
                                        value={host}
                                        onChange={(e) => setHost(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Port
                                    </label>
                                    <input
                                        type="text"
                                        value={port}
                                        onChange={(e) => setPort(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Database Name
                                    </label>
                                    <input
                                        type="text"
                                        value={database}
                                        onChange={(e) => setDatabase(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={ssl}
                                        onChange={(e) => setSsl(e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 block text-sm text-gray-700">
                                        Enable SSL
                                    </label>
                                </div>
                            </div>

                            {/* Generated Connection String */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                    Connection String
                                </h3>

                                <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-medium text-gray-700">
                                            Generated String:
                                        </span>
                                        <button
                                            onClick={() => copyToClipboard(connectionString)}
                                            className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded transition-all duration-200"
                                        >
                                            📋 Copy
                                        </button>
                                    </div>
                                    <textarea
                                        readOnly
                                        value={connectionString}
                                        className="w-full h-32 p-4 bg-white border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="bg-blue-50 rounded-lg p-6">
                                    <h4 className="font-semibold text-gray-800 mb-3">
                                        Environment Variables (.env)
                                    </h4>
                                    <textarea
                                        readOnly
                                        value={envVariables}
                                        className="w-full h-24 p-4 bg-white border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(envVariables)}
                                        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded transition-all duration-200"
                                    >
                                        📋 Copy .env
                                    </button>
                                </div>

                                <div className="bg-green-50 rounded-lg p-6">
                                    <h4 className="font-semibold text-gray-800 mb-3">
                                        NextJS Usage Example
                                    </h4>
                                    <pre className="bg-white p-4 rounded border text-sm overflow-x-auto">
                                        <code>{nextjsExample}</code>
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
