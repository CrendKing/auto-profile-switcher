Automatically switch VSCode profile by current file's extension.

For instance, if profile "Python" is configured to be activated by files with extension "py", every time a .py file is opened or focused, we activate the "Python" profile.

Make sure to install this extension on all profiles needed, so that the switching can happen from any of those.

Note: since VSCode does not have any official API for getting profile information, we are using the similar "hack" from the [Profile Status](https://marketplace.visualstudio.com/items?itemName=robole.profile-status) extension.

## Example configuration

```
"autoProfileSwitcher.mapping": [
    {
        "profile": "C++",
        "extensions": ["cpp", "cxx"]
    },
    {
        "profile": "Python",
        "extensions": ["py"]
    },
],

// By default, disable the switching if the current VSCode window opened a workspace
// Useful if the workspace contains variety of file extensions

"autoProfileSwitcher.disableForWorkspace": true,
```

## Attribution

Extension icon: [Switch icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/switch)
