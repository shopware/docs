---
nav:
  title: Flow Action Reference
  position: 60

---

# Flow Action Reference

```xml
// flow-action.xml
<flow-actions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/Framework/App/FlowAction/Schema/flow-action-1.0.xsd">
    <flow-action>
        <meta>
            <name>slack</name>
            <label>Send slack message</label>
            <label lang="de-DE">Slack-Nachricht senden</label>
            <headline>Headline for send slack message</headline>
            <headline lang="de-DE">Überschrift für das Senden einer Slack-Nachricht</headline>
            <description>Slack send message description</description>
            <description lang="de-DE">Beschreibung der Slack-Sendenachricht</description>
            <url>https://hooks.slack.com/services/{id}</url>
            <sw-icon>default-communication-speech-bubbles</sw-icon>
            <icon>slack.png</icon>
            <requirements>orderAware</requirements>
            <requirements>customerAware</requirements>
        </meta>
        <headers>
            <parameter type="string" name="content-type" value="application/json"/>
        </headers>
        <parameters>
            <parameter type="string" name="text" value="{{ subject }} \n {{ message }} \n Order Number: {{ order.orderNumber }}"/>
        </parameters>
        <config>
            <input-field type="text">
                <name>subject</name>
                <label>Subject</label>
                <label lang="de-DE">Gegenstand</label>
                <place-holder>Placeholder</place-holder>
                <place-holder lang="de-DE">Platzhalter</place-holder>
                <required>true</required>
                <helpText>Help Text</helpText>
                <helpText lang="de-DE">Hilfstext</helpText>
            </input-field>
            <input-field type="textarea">
                <name>message</name>
                <label>Message</label>
                <label lang="de-DE">Nachricht</label>
                <place-holder>Placeholder</place-holder>
                <place-holder lang="de-DE">Platzhalter</place-holder>
                <required>true</required>
                <helpText>Help Text</helpText>
                <helpText lang="de-DE">Hilfstext</helpText>
            </input-field>
        </config>
    </flow-action>
    <flow-action>
        <meta>
            <name>telegram</name>
            <label>Send telegram message</label>
            <label lang="de-DE">Telegrammnachricht senden</label>
            <url>https://api.telegram.org/{id}</url>
            <sw-icon>default-communication-speech-bubbles</sw-icon>
            <icon>telegram.png</icon>
            <requirements>orderAware</requirements>
            <requirements>customerAware</requirements>
        </meta>
        <headers>
            <parameter type="string" name="content-type" value="application/json"/>
        </headers>
        <parameters>
            <parameter type="string" name="chat_id" value="{{ chatId }}"/>
            <parameter type="string" name="text" value="{{ content }}"/>
        </parameters>
        <config>
            <input-field type="text">
                <name>chatId</name>
                <label>Chat Room</label>
                <label lang="de-DE">Chatroom</label>
                <required>true</required>
                <defaultValue>Hello</defaultValue>
                <helpText>This is the chat room id, you can get the id via telegram api</helpText>
                <helpText lang="de-DE">Dies ist die Chatroom-ID, Sie können die ID über die Telegramm-API abrufen</helpText>
            </input-field>
            <input-field type="text">
                <name>subject</name>
                <label>Subject</label>
                <label lang="de-DE">Thema</label>
                <required>true</required>
            </input-field>
            <input-field type="textarea">
                <name>content</name>
                <label>Content</label>
                <label lang="de-DE">Inhalt</label>
            </input-field>
        </config>
    </flow-action>
</flow-actions>
```

## Variables

| Event | Variables |
| :--- | :--- |
| checkout.order.placed <br> state_enter.order.state.cancelled <br> state_enter.order.state.completed <br> state_enter.order.state.in_progress <br>state_enter.order_transaction.state.reminded <br> state_enter.order_transaction.state.open <br> state_enter.order_transaction.state.refunded <br>state_enter.order_transaction.state.paid <br> state_enter.order_transaction.state.cancelled <br> state_enter.order_transaction.state.refunded_partially <br> state_enter.order_transaction.state.paid_partially <br> state_enter.order_delivery.state.cancelled <br>  state_enter.order_delivery.state.shipped <br> state_enter.order_delivery.state.returned_partially <br> state_enter.order_delivery.state.shipped_partially <br> state_enter.order_delivery.state.returned | order |
| customer.group.registration.declined <br> customer.group.registration.accepted | customer <br> customerGroup |
| user.recovery.request | userRecovery |
| checkout.customer.double_opt_in_registration <br> checkout.customer.double_opt_in_guest_order | customer <br> confirmUrl |
| customer.recovery.request | customerRecovery <br> customer <br> resetUrl <br> shopName |
| contact_form.send | contactFormData |
| checkout.customer.register | customer |
| newsletter.register | newsletterRecipient <br> url |
| newsletter.confirm | newsletterRecipient |
