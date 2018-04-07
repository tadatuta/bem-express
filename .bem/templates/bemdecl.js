module.exports = entity => `exports.blocks = [
    { name: 'root' },
    { name: '${entity.block}' }
];
`;
