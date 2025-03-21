import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EquipmentAssignmentForm } from "@/components/equipment-assignment-form"
import { EquipmentExitForm } from "@/components/equipment-exit-form"

export default function Home() {
  return (
    <main className="container mx-auto py-6 md:py-10 px-4 md:px-6">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-center">
        Actas Soporte técnico MoDo
      </h1>

      <Tabs defaultValue="assignment" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 text-base">
          <TabsTrigger value="assignment" className="py-3 text-sm md:text-base">
            Acta de Asignacion de Equipos
          </TabsTrigger>
          <TabsTrigger value="exit" className="py-3 text-sm md:text-base">
            Acta de Salida de Equipos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assignment">
          <div className="rounded-lg border-[1px] bg-card text-card-foreground shadow">
            <div className="p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-semibold mb-4">Acta de Entrega de Equipos y Herramientas</h2>
              <EquipmentAssignmentForm />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="exit">
          <div className="rounded-lg border-[1px] bg-card text-card-foreground shadow">
            <div className="p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-semibold mb-4">Acta de Salida de Equipos y Herramientas</h2>
              <EquipmentExitForm />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}

