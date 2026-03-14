// Add this after modal is appended to DOM
function positionMindMapBranches(container) {
    const branches = container.querySelectorAll('.mindmap-branch');
    const branchCount = branches.length;
    if (branchCount === 0) return;
    
    const radius = 180; // Distance from center
    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;
    
    branches.forEach((branch, i) => {
        const angle = (360 / branchCount) * i;
        const angleRad = (angle - 90) * (Math.PI / 180); // Start from top
        
        const x = centerX + radius * Math.cos(angleRad) - branch.offsetWidth / 2;
        const y = centerY + radius * Math.sin(angleRad) - branch.offsetHeight / 2;
        
        branch.style.position = 'absolute';
        branch.style.left = `${x}px`;
        branch.style.top = `${y}px`;
        branch.style.transform = 'none';
    });
}
