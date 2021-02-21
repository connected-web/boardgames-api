const { read, write } = require('promise-path')

async function rewrite(targetpath, regex, replace) {
  console.log('Rewriting', targetpath, 'using', regex, 'to match and replace with:', replace)
  const targetBody = await read(targetpath, 'utf8')
  console.log('Target path contains', targetBody.length, 'bytes')
  const resultBody = targetBody.replace(regex, replace)
  console.log('Result path contains', resultBody.length, 'bytes')
  await write(targetpath, resultBody, 'utf8')
}

rewrite('package-lock.json', /git\+ssh:\/\/git@github\.com/g, 'https://github.com')