---
nav:
  title: Responding to a Cyber Attack
  position: 20

---

# Responding to a Cyber Attack

As soon as you suspect an attack is in progress, stop public traffic to the affected shop and isolate the affected systems.
Work with your hosting provider to block access at the firewall or load balancer, including access to the Administration and APIs.
Do not rely on the storefront maintenance page alone to contain an attack.

## Get help and preserve evidence

You can always reach out to [Shopware Support](https://support.shopware.com/) for help during an active attack.
You do not need to wait until your investigation is complete.
Involve your hosting provider and agency as needed.

Preserve logs and forensic snapshots before deleting files, restarting services, or restoring backups.
Record when you first noticed the attack and the actions you take.
Do not delay containment while collecting evidence.

## Investigate the entry point and impact

Establish what happened, including:

- How and when the attacker first entered the system, for example through a vulnerability or stolen credentials.
- What level of access they gained, including Administration access, database access, or the ability to execute code on the server.
- What they did with that access, including changes to files, configuration, accounts, orders, or payment flows, and access to or theft of customer data.
- Whether other systems or connected services were affected.

Look for anything that could give the attacker persistent access, such as backdoors, modified plugins, scheduled tasks, additional administrator accounts, or newly created integration credentials.
The absence of obvious changes or log entries does not establish that the system is clean.

## Remove attacker access and recover

Once you understand the entry point, the access gained, and the attacker's actions, remove unauthorized access and reverse the malicious changes.
Fix the weakness or compromised account that allowed the attack; removing a backdoor without closing the entry point leaves the shop exposed.

::: warning
If you suspect remote code execution, assume the entire affected system is compromised.
Deleting visible backdoors or installing a security update is not enough to restore trust.
The safe recovery path is to rebuild affected systems from trusted images and restore a verified backup from before the earliest suspected compromise.
Check that the backup is clean: the attack may have started before you first noticed it.
:::

Apply the required security fixes to Shopware, extensions, dependencies, and infrastructure before making the recovered shop publicly accessible.

## Rotate secrets before reopening

From a trusted device and in the recovered environment, rotate credentials and secrets the attacker may have accessed.
These can include Shopware administrator and integration credentials, database passwords, app secrets, hosting credentials, and keys for external services.
Invalidate existing sessions and tokens, and require affected users to change their passwords before regaining access, including customers whose credentials may have been exposed.
Make sure restoring a backup does not reintroduce compromised credentials or unauthorized accounts.

Restore public traffic only after the entry point is closed, persistent access has been removed, recovery and credential changes are complete, and the shop has been tested.
Monitor for signs of renewed attacker activity after reopening.

## Check legal obligations promptly

Especially if customer data may have been affected, consult a legal advisor promptly about your obligations, including possible notifications to affected customers, data protection authorities, or other relevant authorities.
Reporting deadlines may apply before the investigation is complete; do not wait until recovery is finished to seek advice.
For personal data breaches under the GDPR, see the [European Data Protection Board's guidance](https://www.edpb.europa.eu/sme/assess-the-risks/data-breaches_en).

## Share your findings with Shopware

Reach out to Shopware Support after the incident as well, even if you did not contact us during the active attack.
Share the affected versions, timeline, entry point, access gained, attacker actions, and recovery measures as far as you have established them.
This information helps us improve protections and keep the whole Shopware ecosystem safe.

If you discover a previously unknown vulnerability, report it through our [security reporting page](https://www.shopware.com/en/contact/security-reporting/).
Use private support or security-reporting channels for incident details, and avoid sending unnecessary customer data or secrets.
