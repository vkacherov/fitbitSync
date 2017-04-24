# Telemetry Sync Service 


Labrat is a Clinical Study platform that enables the management of health-related interventions that are targeted to evaluate health effects and outcomes for a specific control group of participants. The platform facilitates resource scheduling, participant and equipment management, as well as device data and telemetry storage configuration.
 
The Telemetry Sync Service (TSS) handles the scheduling and telemetry sync with the 3rd party APIs.

## How it works

TSS provides a set of **<a href="https://azure.microsoft.com/en-us/services/functions/" target="_blank">Azure Functions</a>** that are executed on a configurable schedule. For a `TimerTrigger` to work, you provide a schedule in the form of a [cron expression](https://en.wikipedia.org/wiki/Cron#CRON_expression)(See the link for full details). A cron expression is a string with 6 separate expressions which represent a given schedule via patterns. The pattern we use to represent every 5 minutes is `0 */5 * * * *`. This, in plain text, means: "When seconds is equal to 0, minutes is divisible by 5, for any hour, day of the month, month, day of the week, or year".

