// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// ----------------------------------------------------------------------------

// Support for testing diagnostics in vscode

// tslint:disable:no-unused-expression no-console no-string-based-set-timeout max-line-length
// tslint:disable:insecure-random max-func-body-length radix prefer-template

import * as assert from "assert";
import * as fs from 'fs';
import { commands, window, workspace } from "vscode";
import { getTempFilePath } from "./getTempFilePath";

suite("format document", () => {
    test("format entire document", async () => {
        const json = `{ "$schema": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#", "contentVersion": "1.0.0.0", "parameters": { "location": { "type": "string" } }, "variables": { "vnetId": "[resourceId(resourceGroup().name,'Microsoft.Network/virtualNetworks', parameters('virtualNetworkName'))]" }, "resources": [ { "name": "[parameters('networkInterfaceName')]", "type": "Microsoft.Network/networkInterfaces", "apiVersion": "2018-10-01", "location": "[parameters('location')]", "dependsOn": [ "[concat('Microsoft.Network/networkSecurityGroups/', parameters('networkSecurityGroupName'))]", "[concat('Microsoft.Network/virtualNetworks/', parameters('virtualNetworkName'))]", "[concat('Microsoft.Network/publicIpAddresses/', parameters('publicIpAddressName'))]" ], "properties": { "$test-commandToExecute": "[concat('cd /hub*/docker-compose; sudo docker-compose down -t 60; sudo -s source /set_hub_url.sh ', reference(parameters('publicIpName')).dnsSettings.fqdn, '; sudo docker volume rm ''dockercompose_cert-volume''; sudo docker-compose up')]", "ipConfigurations": [ { "name": "ipconfig1", "properties": { "subnet": { "id": "[variables('subnetRef')]" }, "privateIPAllocationMethod": "Dynamic", "publicIpAddress": { "id": "[resourceId(resourceGroup().name, 'Microsoft.Network/publicIpAddresses', parameters('publicIpAddressName'))]" } }}], "networkSecurityGroup": { "id": "[variables('nsgId')]" } }, "tags": {} } ] }`;
        const expected = `{
            "$schema": "http://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
            "contentVersion": "1.0.0.0",
            "parameters": {
                "location": {
                    "type": "string"
                }
            },
            "variables": {
                "vnetId": "[resourceId(resourceGroup().name,'Microsoft.Network/virtualNetworks', parameters('virtualNetworkName'))]"
            },
            "resources": [
                {
                    "name": "[parameters('networkInterfaceName')]",
                    "type": "Microsoft.Network/networkInterfaces",
                    "apiVersion": "2018-10-01",
                    "location": "[parameters('location')]",
                    "dependsOn": [
                        "[concat('Microsoft.Network/networkSecurityGroups/', parameters('networkSecurityGroupName'))]",
                        "[concat('Microsoft.Network/virtualNetworks/', parameters('virtualNetworkName'))]",
                        "[concat('Microsoft.Network/publicIpAddresses/', parameters('publicIpAddressName'))]"
                    ],
                    "properties": {
                        "$test-commandToExecute": "[concat('cd /hub*/docker-compose; sudo docker-compose down -t 60; sudo -s source /set_hub_url.sh ', reference(parameters('publicIpName')).dnsSettings.fqdn, '; sudo docker volume rm ''dockercompose_cert-volume''; sudo docker-compose up')]",
                        "ipConfigurations": [
                            {
                                "name": "ipconfig1",
                                "properties": {
                                    "subnet": {
                                        "id": "[variables('subnetRef')]"
                                    },
                                    "privateIPAllocationMethod": "Dynamic",
                                    "publicIpAddress": {
                                        "id": "[resourceId(resourceGroup().name, 'Microsoft.Network/publicIpAddresses', parameters('publicIpAddressName'))]"
                                    }
                                }
                            }
                        ],
                        "networkSecurityGroup": {
                            "id": "[variables('nsgId')]"
                        }
                    },
                    "tags": {}
                }
            ]
        }`;

        let filePath = getTempFilePath();
        fs.writeFileSync(filePath, json);
        let doc = await workspace.openTextDocument(filePath);
        await window.showTextDocument(doc);

        await commands.executeCommand('editor.action.formatDocument');

        let output = doc.getText();

        assert.equal(output, expected);

        fs.unlinkSync(filePath);
        await commands.executeCommand('workbench.action.closeActiveEditor');
    });
});