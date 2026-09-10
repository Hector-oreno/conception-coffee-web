const PlannerEmojiPicker = {

    PALETA: [

        "🍗","🍖","🥩","🐟","🍤",
        "🍚","🥔","🥗","🌽","🥑",
        "🍝","🧀","🧅","🌶️","🥕",
        "🍅","🥬","🍞","🫘","🥒",
        "🥦","🍄","🥜","🥥","🥭",
        "🍍","🍌","🍎","🍐","🍋",
        "🍊","🍉"

    ],

    resolver: null,

    abrir() {

        this.resolver = null;

        mostrarModalEstatico("modalEmojiPicker");

        const grid = document.getElementById("emojiPickerGrid");

        if (!grid) return;

        grid.innerHTML = "";

        this.PALETA.forEach(emoji => {

            const div = document.createElement("div");

            div.className = "emoji-option";

            div.textContent = emoji;

            div.onclick = () => {

                console.log("Emoji seleccionado:", emoji);

                ocultarModalEstatico("modalEmojiPicker");

                if (this.resolver) {

                    this.resolver(emoji);

                    this.resolver = null;

                }

            };

            grid.appendChild(div);

        });

    },


    seleccionar() {

        return new Promise(resolve => {

            this.resolver = resolve;

        });

    },

};