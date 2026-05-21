import { useEffect } from 'react';

const BotonMercadoPago = ({ preferenceId }) => {
    useEffect(() => {
        if (!preferenceId) return;

        // Limpiar el contenedor por si acaso hay un botón viejo
        const container = document.getElementById('wallet_container');
        if (container) container.innerHTML = '';

        const mp = new window.MercadoPago('APP_USR-11bfebf8-2c6c-4840-9f8b-d937d642e9c0', {
            locale: 'es-CL'
        });

        const bricksBuilder = mp.bricks();

        const renderComponent = async () => {
            await bricksBuilder.create("wallet", "wallet_container", {
                initialization: {
                    preferenceId: preferenceId,
                    redirectMode: 'modal'
                },
                customization: {
                    texts: { valueProp: 'smart_option' },
                    visual: {
                        buttonHeight: '52px',
                        borderRadius: '16px',
                    }
                },
            });
        };

        renderComponent();
    }, [preferenceId]);

    return (
        <div className="w-full">
            <p className="text-[10px] text-blue-500 font-black mb-3 text-center uppercase tracking-widest">
                Finalizar con Mercado Pago
            </p>
            {/* Aquí es donde se inyectará el botón */}
            <div id="wallet_container"></div>
        </div>
    );
};

export default BotonMercadoPago;