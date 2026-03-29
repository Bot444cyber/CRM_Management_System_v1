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
            background-color: #f8fafc;
            color: #18181b;
            -webkit-font-smoothing: antialiased;
        }

        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f8fafc;
            padding-bottom: 40px;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            margin-top: 40px;
            border: 1px solid #e2e8f0;
        }

        /* Header */
        .header {
            background-color: #09090b;
            padding: 32px;
            text-align: center;
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
            color: #09090b;
            margin-bottom: 16px;
        }

        .content p {
            margin-bottom: 24px;
            color: #3f3f46;
            font-size: 15px;
        }

        .content strong {
            color: #09090b;
        }

        /* Button */
        .button-container {
            text-align: center;
            margin: 32px 0;
        }

        .button {
            display: inline-block;
            background-color: #09090b;
            color: #ffffff !important;
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
            color: #71717a;
            background-color: #fafafa;
            border-top: 1px solid #f1f5f9;
        }

        .footer a {
            color: #09090b;
            text-decoration: none;
            font-weight: 500;
        }

        .footer a:hover {
            color: #000000;
            text-decoration: underline;
        }

        /* Utils */
        .code-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
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
            background-color: #e2e8f0;
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


