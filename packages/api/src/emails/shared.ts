export const emailColors = {
	bg: "#FAF8F5",
	brand: "#1E1A15",
	gold: "#B8860B",
	muted: "#7A7062",
	border: "#E5DED4",
};

/**
 * Base email frame matching the Autter harbour design system.
 * Pure-HTML version of the React Email AccessEmailFrame.
 */
export function accessEmailFrame({
	preview,
	headerTag,
	body,
}: {
	preview: string;
	headerTag: string;
	body: string;
}): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light" />
<title>${headerTag}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#EDEAE5;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:24px;color:${emailColors.brand};">
<!-- Preview text (hidden) -->
<div style="display:none;max-height:0;overflow:hidden;">${preview}</div>
<div style="display:none;max-height:0;overflow:hidden;">&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#EDEAE5;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="520" style="max-width:520px;width:100%;background-color:${emailColors.bg};border:1px solid ${emailColors.border};border-radius:4px;">
<tr><td>
${body}
</td></tr>

<!-- Footer -->
<tr><td style="padding:20px 24px;border-top:1px solid ${emailColors.border};text-align:center;">
<p style="margin:0;color:${emailColors.muted};font-family:Inconsolata,'Courier New',monospace;font-size:11px;line-height:18px;letter-spacing:0.04em;">
&copy; autter.dev &middot; Built with care by otters
</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
