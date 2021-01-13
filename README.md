# commit-files
GitHub action to commit files

## Building the action

After you've made the neccesary changes you must build the action for them to useable.

Husky will automatically run this whenever you commit and commit the built changes as well.

However, if you ever want to build the action manually just run `npm run build` which will compile all the JS code into single `index.js` file, inside the `dist` folder.

## Example of use

This is how the action is used:  
```
    steps:
    - name: Validating the manifest
      uses: SpareRoom/validate-remote-assets@master
      with:
        json_file: ./build/manifest.json
        remote_path: http://assets.spareroom.co.uk
```

It will iterate through each value of the passed in JSON file, and make a request with that file to your passed in `remote_path`. It will fail if any of the files return a non-200 status.
