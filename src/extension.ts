import fs from 'fs/promises'
import * as vscode from 'vscode'

const EXTENSION_NAME = 'autoProfileSwitcher'
const CONFIG_NAME_MAPPING = 'mapping'
const CONFIG_NAME_DFW = 'disableForWorkspace'
const CMD_ACTIVATE_PROFILE_PREFIX = 'workbench.profiles.actions.profileEntry.'

const profileToIdMap = new Map()
const profileToExtsMap = new Map()

let disableForWorkspace = true

function getGlobalStoragePath(context: vscode.ExtensionContext) {
    let portableAppPath = process.env.VSCODE_PORTABLE
    let prefix

    if (portableAppPath) {
        prefix = `${portableAppPath}/user-data`
    } else {
        prefix = `${context.globalStorageUri.fsPath}/../../..`
    }

    return prefix + '/User/globalStorage/storage.json'
}

async function buildProfileToIdMap(context: vscode.ExtensionContext) {
    const globalStoragePath = getGlobalStoragePath(context)
    const globalStorageData = await fs.readFile(globalStoragePath, { encoding: 'utf-8' })
    const globalStorageObj = JSON.parse(globalStorageData)

    for (const profile of globalStorageObj['userDataProfiles']) {
        profileToIdMap.set(profile['name'], profile['location'])
    }
}

function parseConfig() {
    const config = vscode.workspace.getConfiguration(EXTENSION_NAME)

    for (const entry of config.get<{ profile: string, extensions: string[] }[]>(CONFIG_NAME_MAPPING, [])) {
        const extensions = entry['extensions']
        for (const ext of extensions) {
            profileToExtsMap.set(ext, entry['profile'])
        }
    }

    disableForWorkspace = config.get<boolean>(CONFIG_NAME_DFW, true)
}

function handleConfigurationChange(evt: vscode.ConfigurationChangeEvent) {
    if (evt.affectsConfiguration(EXTENSION_NAME)) {
        parseConfig()
    }
}

function getActiveFileExtension(editor?: vscode.TextEditor) {
    const fileName = editor?.document.fileName
    if (!fileName) {
        return null
    }

    const parts = fileName.split('.')
    return parts.length > 1 ? parts.pop() : null
}

async function handleDocumentChange(editor?: vscode.TextEditor) {
    if (disableForWorkspace && vscode.workspace.workspaceFolders) {
        return
    }

    const extension = getActiveFileExtension(editor)
    if (extension) {
        const profileName = profileToExtsMap.get(extension)
        if (profileName) {
            const profileId = profileToIdMap.get(profileName)
            if (profileId) {
                await vscode.commands.executeCommand(`${CMD_ACTIVATE_PROFILE_PREFIX}${profileId}`)
            }
        }
    }
}

function switchForActiveDocument() {
    return handleDocumentChange(vscode.window.activeTextEditor)
}

export async function activate(context: vscode.ExtensionContext) {
    await buildProfileToIdMap(context)

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(handleConfigurationChange),
        vscode.workspace.onDidOpenTextDocument(switchForActiveDocument),
        vscode.window.onDidChangeActiveTextEditor(handleDocumentChange),
    )

    parseConfig()
    switchForActiveDocument()
}

export function deactivate() { }
