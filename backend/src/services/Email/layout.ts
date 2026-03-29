/**
 * Base professional layout for Monkframe emails.
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
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            margin-top: 40px;
            border: 1px solid #e4e4e7;
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
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.025em;
            text-transform: uppercase;
        }

        .header p {
            color: #a1a1aa;
            margin: 8px 0 0 0;
            font-size: 14px;
        }

        /* Content */
        .content {
            padding: 40px 32px;
            line-height: 1.6;
        }

        .content h2 {
            margin-top: 0;
            font-size: 20px;
            font-weight: 600;
            color: #09090b;
        }

        .content p {
            margin-bottom: 24px;
            color: #3f3f46;
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
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            font-size: 14px;
            transition: opacity 0.2s;
        }

        /* Footer */
        .footer {
            padding: 32px;
            text-align: center;
            font-size: 12px;
            color: #71717a;
            background-color: #fafafa;
            border-top: 1px solid #f4f4f5;
        }

        .footer a {
            color: #09090b;
            text-decoration: underline;
        }

        /* Utils */
        .code-box {
            background-color: #f4f4f5;
            border: 1px solid #e4e4e7;
            padding: 16px;
            border-radius: 8px;
            text-align: center;
            font-family: 'Courier New', Courier, monospace;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 8px;
            color: #09090b;
            margin: 24px 0;
        }

        .divider {
            height: 1px;
            background-color: #e4e4e7;
            margin: 24px 0;
        }

        @media only screen and (max-width: 600px) {
            .container {
                margin-top: 20px;
                border-radius: 0;
                width: 100% !important;
            }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1>Monkframe</h1>
                <p>Intelligent CRM Solutions</p>
            </div>
            
            <div class="content">
                ${content}
            </div>

            <div class="footer">
                &copy; ${currentYear} Monkframe CRM. All rights reserved.<br>
                <br>
                You received this email because you are a registered user of Monkframe.<br>
                <a href="https://monkframer.online/privacy">Privacy Policy</a> • <a href="https://monkframer.online/terms">Terms of Service</a>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

