import { accessEmailFrame, emailColors } from "./shared";

function digitCell(digit: string, key: string): string {
	return `<td style="padding-right:4px;">
<div style="display:inline-block;width:44px;height:56px;line-height:56px;text-align:center;background-color:#FFFFFF;border:2px solid ${emailColors.border};font-family:Inconsolata,'Courier New',monospace;font-size:28px;font-weight:700;color:${emailColors.brand};">
${digit}
</div>
</td>`;
}

export function otpSignInEmail({
	email,
	otp,
	expiresInMinutes,
	appUrl = "https://autter.dev",
}: {
	email: string;
	otp: string;
	expiresInMinutes: number;
	appUrl?: string;
}): string {
	const logoBase = `${appUrl.replace(/\/$/, "")}/logo`;
	const firstHalf = otp.slice(0, 3);
	const secondHalf = otp.slice(3);

	const otpCells = [
		...firstHalf.split("").map((d, i) => digitCell(d, `a${i}`)),
		// Separator
		`<td style="padding:0 8px;vertical-align:middle;">
<div style="width:12px;height:2px;background-color:${emailColors.border};"></div>
</td>`,
		...secondHalf.split("").map((d, i) => digitCell(d, `b${i}`)),
	].join("\n");

	const body = `
<!-- Header -->
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr><td style="background-color:${emailColors.bg};border-bottom:1px solid ${emailColors.border};padding:28px 24px 22px;">
<p style="margin:0 0 12px;color:${emailColors.gold};font-family:Inconsolata,'Courier New',monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;">
Sign In
</p>
<p style="margin:0 0 10px;color:${emailColors.brand};font-family:Quattrocento,Georgia,serif;font-size:30px;line-height:36px;">
Your key to the harbour.
</p>
<p style="margin:0;color:${emailColors.muted};font-size:15px;line-height:24px;">
Use the code below to sign in to your autter.dev account.
</p>
</td></tr>
</table>

<!-- Account + OTP block -->
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr><td style="padding:28px 24px 8px;">
<p style="margin:0 0 20px;color:#3A3228;font-size:15px;line-height:24px;">
A sign-in request was received for <strong style="color:${emailColors.brand};">${email}</strong>.
</p>

<!-- OTP digits -->
<table cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
<tbody><tr>
${otpCells}
</tr></tbody>
</table>

<p style="margin:10px 0 0;color:${emailColors.muted};font-family:Inconsolata,'Courier New',monospace;font-size:11px;line-height:18px;">
Expires in ${expiresInMinutes} minutes &middot; One-time use only &middot; Do not share this code
</p>
</td></tr>
</table>

<!-- Mascot -->
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr><td style="padding:16px 24px 28px;text-align:center;">
<img src="${logoBase}/autter-security.png" alt="Autter security captain" width="140" style="display:block;margin:0 auto;" />
</td></tr>
</table>`;

	return accessEmailFrame({
		preview: `${otp} is your autter.dev sign-in code`,
		headerTag: "Sign In",
		body,
	});
}
