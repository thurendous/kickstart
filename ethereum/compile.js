const path = require("path");
const solc = require("solc");
const fs = require("fs-extra"); // fs(file system)-extra is a community version of the module fs, it has some extra functions in it.
// we compile the file into the /build directory cuz we want not to complie everytime when we do the compliation.

// this is to remove the whole build folder
const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath); // removeSync is a new function included in the fs module. the old npm module cannot easily delete a file or a folder inside of it.

const campaignPath = path.resolve(__dirname, "contracts", "Campaign.sol");
const source = fs.readFileSync(campaignPath, "utf8");
const output = solc.compile(source, 1).contracts;

fs.ensureDirSync(buildPath); // "ensureDir" checks if the directory exists or not. if not, the function will create for us.

console.log(output);
for (let contract in output) {
  // let contract in sth => 这里的含义是让这个contract成为这个obeject的属性值。
  fs.outputJsonSync(
    path.resolve(buildPath, contract + ".json"),
    output[contract]
  );
}
