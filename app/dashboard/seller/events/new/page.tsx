import EventForm from '@/components/EventForm'

export default function NewEventPage() {
    return (
        <div className="bg-background">
            <div className="max-w-3xl mx-auto p-6">
                <div className="bg-card rounded-sm shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-8 text-primary-foreground">
                        <h2 className="text-2xl font-bold">Criar Novo Evento</h2>
                        <p className="text-primary-foreground/80 mt-2">Liste seu evento e comece a vender ingressos</p>
                    </div>

                    <div className="p-6">
                        <EventForm mode="create" />
                    </div>
                </div>
            </div>
        </div>
    )
}
