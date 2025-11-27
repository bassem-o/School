const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Copy admin dashboard build to dist root
console.log('Copying admin dashboard...');
copyFolderRecursiveSync('admin_dashboard/dist', 'dist');

// Copy teacher dashboard build to dist/teacher
console.log('Copying teacher dashboard...');
const teacherDest = 'dist/teacher';
if (!fs.existsSync(teacherDest)) {
    fs.mkdirSync(teacherDest, { recursive: true });
}
copyFolderRecursiveSync('teacher_dashboard/dist', teacherDest);

console.log('Build merge complete!');

function copyFolderRecursiveSync(source, target) {
    // Check if folder needs to be created or integrated
    const targetFolder = path.join(target, path.basename(source));

    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    // Copy
    if (fs.lstatSync(source).isDirectory()) {
        const files = fs.readdirSync(source);
        files.forEach(function (file) {
            const curSource = path.join(source, file);
            if (fs.lstatSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, target);
            } else {
                fs.copyFileSync(curSource, path.join(target, file));
            }
        });
    }
}
