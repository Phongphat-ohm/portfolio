"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeading from "@/components/PageHeading";
import Link from "next/link";
import { HiArrowLeft, HiArrowPath, HiCheck, HiOutlineClipboard } from "react-icons/hi2";


import { useEffect, useState } from "react";

export default function Home() {
    const [copyMessage, setCopyMessage] = useState("");
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
            template:
                "mysql://{{username}}:{{password}}@{{host}}:{{port}}/{{database}}{{ssl}}",
            envPrefix: "MYSQL",
        },
        postgresql: {
            port: "5432",
            template:
                "postgresql://{{username}}:{{password}}@{{host}}:{{port}}/{{database}}{{ssl}}",
            envPrefix: "POSTGRES",
        },
        mongodb: {
            port: "27017",
            template:
                "mongodb://{{username}}:{{password}}@{{host}}:{{port}}/{{database}}{{ssl}}",
            envPrefix: "MONGODB",
        },
        sqlserver: {
            port: "1433",
            template:
                "sqlserver://{{username}}:{{password}}@{{host}}:{{port}};database={{database}}{{ssl}}",
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

    const copyToClipboard = async (text: string) => {
        try { await navigator.clipboard.writeText(text); setCopyMessage("Copied to clipboard."); }
        catch { setCopyMessage("Copy failed. Select the output and copy it manually."); }
    };

    return <><Navbar /><main id="main-content" className="wrap page-content tool-content">
      <Link href="/app" className="breadcrumb"><HiArrowLeft /> Back to playground</Link>
      <PageHeading title="Connection string generator.">สร้าง Connection String สำหรับฐานข้อมูล — choose a database and enter your connection details.</PageHeading>
      <fieldset className="tool-fieldset"><legend>Database type / ประเภทฐานข้อมูล</legend><div className="choice-row">{["mysql","postgresql","mongodb","sqlserver"].map(db => <button key={db} className="choice" aria-pressed={selectedDb === db} onClick={() => { setSelectedDb(db); setPort(dbConfigs[db].port); }}>{db === "sqlserver" ? "SQL Server" : db === "postgresql" ? "PostgreSQL" : db === "mysql" ? "MySQL" : "MongoDB"}</button>)}</div></fieldset>
      <div className="tool-panel tool-columns"><div className="form-stack">
        <h2 className="text-xl font-medium">Connection details</h2>
        {[{label:"Host / Server",value:host,set:setHost,type:"text"},{label:"Port",value:port,set:setPort,type:"text"},{label:"Database name",value:database,set:setDatabase,type:"text"},{label:"Username",value:username,set:setUsername,type:"text"},{label:"Password",value:password,set:setPassword,type:"password"}].map(field => <label key={field.label}><span className="field-label">{field.label}</span><input className="input w-full" type={field.type} value={field.value} onChange={event => field.set(event.target.value)} autoComplete="off" spellCheck={false} /></label>)}
        <label className="flex items-center gap-3 min-h-11"><input className="checkbox checkbox-primary" type="checkbox" checked={ssl} onChange={event => setSsl(event.target.checked)} /> Enable SSL</label>
      </div><div>
        {[{title:"Connection string",value:connectionString},{title:"Environment variables",value:envVariables}].map(output => <div key={output.title} className="output-panel"><div className="output-toolbar"><h2>{output.title}</h2><button className="btn btn-outline btn-sm" onClick={() => copyToClipboard(output.value)} aria-label={`Copy ${output.title.toLowerCase()}`}><HiOutlineClipboard /> Copy</button></div><textarea readOnly className="code-output" value={output.value} aria-label={output.title} spellCheck={false} /></div>)}
        <p className="copy-status mt-3" role="status">{copyMessage}</p>
      </div></div>
      <details className="mt-8"><summary className="min-h-11 cursor-pointer font-medium">View JavaScript connection example</summary><pre className="output-panel code-output mt-4">{nextjsExample}</pre></details>
    </main><Footer /></>;
}
