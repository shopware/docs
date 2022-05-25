# Flow Action Reference

{% code title="flow-action.xml" %}
```xml
<flow-actions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/Framework/App/FlowAction/Schema/flow-action-1.0.xsd">
    <flow-action>
        <meta>
            <name>slack.send.message</name>
            <badge>Slack</badge>
            <label>Send slack message</label>
            <label lang="de-DE">Send slack message</label>
            <description>Slack send message description</description>
            <description lang="de-DE">Slack send message description DE</description>
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
                <label lang="de-DE">Text DE</label>
                <place-holder>Enter Text...</place-holder>
                <place-holder lang="de-DE">Enter Text DE...</place-holder>
                <required>true</required>
                <helpText>Help Text</helpText>
                <helpText lang="de-DE">Help DE</helpText>
            </input-field>
            <input-field type="textarea">
                <name>message</name>
                <label>Message</label>
                <label lang="de-DE">Text DE</label>
                <place-holder>Enter Text...</place-holder>
                <place-holder lang="de-DE">Enter Text DE...</place-holder>
                <required>true</required>
                <helpText>Help Text</helpText>
                <helpText lang="de-DE">Help DE</helpText>
            </input-field>
        </config>
    </flow-action>
</flow-actions>
```
{% endcode %}