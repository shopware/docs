# Add custom flow actions via App System

{% hint style="info" %}
The App Flow Action is available in Shopware 6.4.10.0, and are not supported in previous versions.
{% endhint %}

Besides the default actions, one extending way for the App System developer is to add more actions to the Flow Builder actions list via App System:

![App Flow Action preview](../../../../../.gitbook/assets/flow-builder-app-action-preview.png)

The app flow action can allow shopware to interact with your third-party services. 

After reading, you will be able to

 * Create the basic setup of an app to create more action for Flow Builder actions.
 * Use the new actions to interact with your third-party services.

## Prerequisites

Please make sure you already have a working Shopware 6 store running (either cloud or self-managed). Prior knowledge about the Flow Builder feature of Shopware 6 is useful.

Reference the flow-concept here:

{% page-ref page="../../../../../concepts/framework/flow-concept.md" %}

## Create the App Flow Actions

To get started with your app, create an apps folder inside the custom folder of your Shopware dev installation. In there, create another folder for your application, provide a manifest file, and so on with this structure.

```text
└── custom
    ├── apps
    │   └── FlowBuilderActionApp
    │       └── Resources
    │           └── flow-action.xml
    │           └── app-icon.png
    │           └── slack-icon.png
    │       └── manifest.xml
    └── plugins
```

| File Name | Description |
| :--- | :--- |
| FlowBuilderActionApp | Your app technical name.
| app-icon.png | Your icon app. |
| slack-icon.png | Your action icon will be defined for each action in the `flow-action.xml` file. (optional, because if you are not defined, the actions will get the fallback icons). |
| flow-action.xml | Place to define your new actions. |
| manifest.xml | Base information about your app. |

## Manifest file

The manifest file is the central point of your app. It defines the interface between your app and the Shopware instance. It provides all the information concerning your app, as seen in the minimal version below:

{% code title="manifest.xml" %}
```xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/Framework/App/Manifest/Schema/manifest-1.0.xsd">
    <meta>
        <name>FlowBuilderActionApp</name>
        <label>Flow Builder Action App</label>
        <label lang="de-DE">Flow Builder Action App DE</label>
        <description>This is the example description for app</description>
        <description lang="de-DE">This is the example description for app</description>
        <author>shopware AG</author>
        <copyright>(c) shopware AG</copyright>
        <version>4.14.0</version>
        <icon>Resources/app.png</icon>
        <license>MIT</license>
    </meta>
</manifest>
```
{% endcode %}

{% hint style="warning" %}
The name of your app that you provide in the manifest file needs to match the folder name of your app.
{% endhint %}

## Flow-action file

To create an action, you need to define a `<flow-action>` block. Each `<flow-action>` represents one action and you can define an arbitrary number of actions.

{% code title="flow-action.xml" %}
```xml
<flow-actions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/Framework/App/FlowAction/Schema/flow-action-1.0.xsd">
    <flow-action>
        ... # The first action
    </flow-action>
    <flow-action>
        ... # The second action
    </flow-action>
    <flow-action>
        ... # The third action
    </flow-action>
    ...
</flow-actions>
```
{% endcode %}

Refer the [flow-action-1.0.xsd](https://gitlab.shopware.com/shopware/6/product/platform/-/raw/next-19083/update-app-manifest-xsd-for-flow-action/src/Core/Framework/App/FlowAction/Schema/flow-action-1.0.xsd) to coutinue define the other tag inside the `<flow-action>`.

### Meta tag

```xml
<flow-action>
    <meta>
        <name>slack.send.message</name>
        <label>Send slack message</label>
        <label lang="de-DE">Send slack message</label>
        <badge>Slack</badge>
        <description>Slack send message description</description>
        <description lang="de-DE">Slack send message description DE</description>
        <url>https://hooks.slack.com/services/{id}</url>
        <sw-icon>default-communication-speech-bubbles</sw-icon>
        <icon>slack.png</icon>
        <requirements>orderAware</requirements>
        <requirements>customerAware</requirements>
    </meta>
    ...
</flow-action>
```

| Key | Required | Description |
| :--- | :--- | :--- |
| name | Yes | The technical name of your action, that is unique for all actions |
| label | Yes | A name to be shown for your action in the Actions list or action modal title. |
| badge | No | A attached badge showed behind the label in the action modal title. |
| description| Yes | The detail information for you action. |
| sw-icon | No | The icon component name, see more icons at [Shopware](https://component-library.shopware.com/icons/) |
| icon | No | The icon path for you action. You can use `<sw-icon>` or `<icon>` to define you action icon.
| requirements | Yes | Like `aware` on the `FlowAction`, it will decide if you action is allowed to use each `TrriggerEvent` or not.<br> For Exam: <br> The `checkout.order.placed` has `orderAware`, that means your action is allow to use to trigger the `checkout.order.placed` event, because you have been define the `<requirements>orderAware</requirements>` on your app action.
| url | Yes | The most impotant tag. This is place to define your services webhook. Shopware will interact with your services via this URL webhook.


### Header tag

```xml
<flow-action>
    <meta>
        ...
    </meta>
    <headers>
        <parameter type="string" name="content-type" value="application/json"/>
    </headers>
    ...
<flow-action>
 ```

| Key | Description |
| :--- | :--- |
| type | Type of parameter, only support `string` type. |
| name | The header key. |
| value | The header value. |

Define the `parameter` for the URL header based on your URL webhook services.

### Parameter

```xml
<flow-action>
    <meta>
        ...
    </meta>
    <headers>
        ...
    </headers>
    <parameters>
        <parameter type="string" name="text" value="{{ message }} \n Order Number: {{ order.orderNumber }}"/>
    </parameters>
    ...
<flow-action>
 ```

Define the `parameter` for the URL body based on your URL webhook services.

| Key | Description |
| :--- | :--- |
| type | Type of parameter, only support `string` type. |
| name | The body key for your URL. |
| value | The content message for your URL; free to design your content message here. |
| {{ message }} | The variable on your `<input-field>` you will define on `flow-action.xml`. |
| {{ order.orderNumber }} | For each trigger event, the action will have the variables suitable. In this case, the `checkout.order.placed` will have `order` variable. |

### Input-field tag

```xml
<flow-action>
    <meta>
        ...
    </meta>
    <headers>
        ...
    </headers>
    <parameters>
        ...
    </parameters>
    <config>
        <input-field type="text">
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
<flow-action>
```

Define your input field attributes.

| Key | Required |
| :--- | :--- |
| name | Yes |
| label | Yes |
| place-holder | No |
| required | No |
| helpText | No |

Define your input field type like ```<input-field type="text"> ```. The following types are supported:


| Type | The shopware component will be render |
| :--- | :--- |
| text | `<sw-text-field/>` |
| textarea | `<sw-textarea-field/>` |
| text-editor | `<sw-text-editor/>` |
| url | `<sw-url-field/>` |
| password | `<sw-password-field/>` |
| int | `<sw-number-field/>` |
| float | `<sw-number-field/>`  |
| bool | `<sw-switch-field/>`  |
| checkbox | `<sw-checkbox-field/>`  |
| datetime | `<sw-datepicker/>`  |
| date | `<sw-datepicker/>` |
| time | `<sw-datepicker/>` |
| colorpicker | `<sw-colorpicker/>` |
| single-select | `<sw-single-select/>` |
| ulti-select | `<sw-multi-select/>` |

# Install the App Flow Action

The app can now be installed by running the following command:

```bash
bin/console app:install --activate FlowBuilderActionApp
```


Reference the example for App flow action here:

{% page-ref page="../../../../../resources/references/app-reference/flow-action-reference.md" %}