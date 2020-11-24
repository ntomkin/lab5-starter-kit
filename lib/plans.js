var Plans = {
    items: [
        {
            name: "basic",
            label: "Basic",
            price: "10",
            product_id: "prod_IKuxCijIPhmFrB",
            price_id: "price_1HkF7dIwNv8toLXhPKbOKXMB"
        },
        {
            name: "plus",
            label: "Plus",
            price: "20",
            product_id: "prod_IKuyqWnC7W0d1K",
            price_id: "price_1HkF86IwNv8toLXh72miEhuu"
        },
        {
            name: "advanced",
            label: "Advanced",
            price: "30",
            product_id: "prod_IKuyoXgHW9fSWo",
            price_id: "price_1HkF8KIwNv8toLXhzzjT907B"
        }
    ],
    async get_plan_by_name(name) {
        let element_to_return;
        Plans.items.forEach(function(element) {
            if(name == element.name) {
                element_to_return = element;
            }
        });

        return element_to_return;
    },
    async get_plan_by_product_id(id) {
        let element_to_return;
        Plans.items.forEach(function(element) {
            if(id == element.product_id) {
                element_to_return = element;
            }
        });

        return element_to_return;
    }
}

module.exports = Plans;