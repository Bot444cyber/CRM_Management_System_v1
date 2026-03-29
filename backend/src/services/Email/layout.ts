/**
 * Base professional layout for odoo emails.
 * Uses a Zinc/Dark aesthetic with high-fidelity styling.
 */
export function baseLayout(title: string, content: string): string {
    const currentYear = new Date().getFullYear();
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        /* Base styles */
        body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #0c0c0e;
            color: #ffffff;
            -webkit-font-smoothing: antialiased;
        }

        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #0c0c0e;
            padding-bottom: 40px;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #121214;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
            margin-top: 40px;
            border: 1px solid #27272a;
        }

        /* Header */
        .header {
            background-color: #09090b;
            padding: 32px;
            text-align: center;
            border-bottom: 1px solid #1e1e21;
        }

        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 26px;
            font-weight: 800;
            letter-spacing: -0.05em;
            text-transform: uppercase;
        }

        .header p {
            color: #71717a;
            margin: 4px 0 0 0;
            font-size: 13px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }

        /* Content */
        .content {
            padding: 40px 32px;
            line-height: 1.6;
        }

        .content h2 {
            margin-top: 0;
            font-size: 22px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 16px;
        }

        .content p {
            margin-bottom: 24px;
            color: #a1a1aa;
            font-size: 15px;
        }

        .content strong {
            color: #ffffff;
        }

        /* Button */
        .button-container {
            text-align: center;
            margin: 32px 0;
        }

        .button {
            display: inline-block;
            background-color: #ffffff;
            color: #000000 !important;
            padding: 14px 28px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 700;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            transition: background-color 0.2s;
        }

        /* Footer */
        .footer {
            padding: 32px;
            text-align: center;
            font-size: 12px;
            color: #52525b;
            background-color: #0c0c0e;
            border-top: 1px solid #1e1e21;
        }

        .footer a {
            color: #a1a1aa;
            text-decoration: none;
            font-weight: 500;
        }

        .footer a:hover {
            color: #ffffff;
            text-decoration: underline;
        }

        /* Utils */
        .code-box {
            background-color: rgba(255, 255, 255, 0.03);
            border: 1px solid #27272a;
            padding: 24px;
            border-radius: 12px;
            text-align: center;
            font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
            font-size: 32px;
            font-weight: 800;
            letter-spacing: 6px;
            color: #10b981;
            margin: 24px 0;
        }

        .label {
            color: #71717a;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            margin-bottom: 8px;
            display: block;
        }

        .divider {
            height: 1px;
            background-color: #1e1e21;
            margin: 24px 0;
        }

        @media only screen and (max-width: 600px) {
            .container {
                margin-top: 0;
                border-radius: 0;
                width: 100% !important;
                border: none;
            }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1>odoo</h1>
                <p>Intelligent CRM Solutions</p>
            </div>
            
            <div class="content">
                ${content}
            </div>

            <div class="footer">
                &copy; ${currentYear} odoo CRM. All rights reserved.<br>
                <br>
                You received this email because you are a registered user of odoo.<br>
                <a href="https://monkframer.online/privacy">Privacy Policy</a> • <a href="https://monkframer.online/terms">Terms of Service</a>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}


