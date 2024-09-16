export function registerSystemSettings() {
    game.settings.register('godbound', 'words', {
        name: 'Words',
        hint: 'A comma-separated list of the words available for use in the game. Values will be trimmed, but casing is preserved.',
        scope: 'world', // "world" = sync to db, "client" = local storage
        config: true, // false if you dont want it to show in module config
        type: String, // You want the primitive class, e.g. Number, not the name of the class as a string
        default: '',
    })
}

export function registerDeferredSettings() {
    // game.settings.register('godbound', 'myDeferredSetting', {
    //     name: 'My Deferred Setting',
    //     hint: 'A description of the registered setting and its behavior.',
    //     scope: 'world',
    //     config: true,
    //     type: String,
    //     default: 'default value',
    //     onChange: (value) => {
    //         console.log(value)
    //     },
    // })
}
