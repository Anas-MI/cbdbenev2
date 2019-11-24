const mainMenus = [
    {
        label: "Shop",
        link: "/shop",
        subMenus: [
            {
                label: "Topicals",
                link: "/category/?cid=topicals",
                action: "link",
                as: "/category/topicals",
            },
            {
                label: "Pets",
                link: "/category/?cid=pets",
                action: "link",
                as: "/category/pets",
            },
            {
                label: "Edibles",
                link: "/category/?cid=edibles",
                action: "link",
                as: "/category/edibles",
            },
            {
                label: "Capsules",
                link: "/category/?cid=capsules",
                action: "link",
                as: "/category/capsules",
            },
            {
                label: "Oils",
                link: "/category/?cid=oils",
                action: "link",
                as: "/category/oils",
            },
        ]
    }
]
export default mainMenus