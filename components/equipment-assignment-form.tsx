"use client"

import { useState, useRef, useCallback } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Printer, Download, Plus, Trash2 } from "lucide-react"
import html2pdf from "html2pdf.js"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Esquema de validación con arreglo de ítems
const formSchema = z.object({
  date: z.date({ required_error: "La fecha es requerida" }),
  assignedTo: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  location: z.string().min(2, { message: "El lugar debe tener al menos 2 caracteres" }),
  idNumber: z.string().min(1, { message: "El número de cédula es requerido" }),
  items: z.array(
    z.object({
      serialNumber: z.string().min(1, { message: "El número de serie es requerido" }),
      description: z.string().min(1, { message: "La descripción es requerida" }),
      quantity: z.coerce.number().min(1, { message: "La cantidad debe ser al menos 1" }),
    })
  ).min(1, { message: "Debe haber al menos un ítem" }),
})

type FormValues = z.infer<typeof formSchema>

// Componente de vista previa con tipado corregido
const AssignmentPreview = ({ values, pdfRef }: { values: FormValues; pdfRef: React.RefObject<HTMLDivElement | null> }) => {
  return (
    <div ref={pdfRef} className="bg-white p-4 max-w-[8.5in] mx-auto">
      <div className="flex items-center border-[1px] border-gray-300 p-2">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-gQSfpgvgyQxf0yRwZnjkfdp4vrI1lM.png"
          alt="Logo MODO"
          width={80}
          height={53}
          className="mr-4"
        />
        <div>
          <p className="text-base font-semibold">ACTA DE ENTREGA DE EQUIPOS Y HERRAMIENTAS</p>
          <p className="text-sm">CORPORACIÓN MODO CARACAS, C.A</p>
        </div>
      </div>
      <br />

      <table className="w-full border-collapse">
        <tbody>
          <tr className="border-[1px] border-gray-300">
            <td className="py-1 px-2 w-1/4 font-semibold text-xs md:text-sm">Fecha:</td>
            <td className="py-1 px-2 border-l-[1px] border-gray-300 text-xs md:text-sm">
              {format(values.date, "dd/MM/yyyy", { locale: es })}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-1 py-1">Persona Asignada:</td>
            <td className="border border-gray-300 px-1 py-1">{values.assignedTo}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-1 py-1">Lugar:</td>
            <td className="border border-gray-300 px-1 py-1">{values.location}</td>
          </tr>
        </tbody>
      </table>
      <br />

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-gray-300 px-2 py-1 text-center">SERIE O REFERENCIA DEL EQUIPO</th>
            <th className="border border-gray-300 px-2 py-1 text-center">DESCRIPCIÓN</th>
            <th className="border border-gray-300 px-2 py-1 text-center">CANTIDAD</th>
          </tr>
        </thead>
        <tbody>
          {values.items.map((item, index) => (
            <tr key={index}>
              <td className="border border-gray-300 px-2 py-1 text-center">{item.serialNumber}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{item.description}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table><br />

      <div className="space-y-10 pt-4">
        <p className="text-sm leading-relaxed">
          Yo, <span className="font-semibold">{values.assignedTo}</span> titular de la cédula de identidad No.{" "}
          <span className="font-semibold">{values.idNumber}</span>, declaro haber recibido mediante la presente Acta, los equipos mencionados en este documento en perfectas condiciones de operatividad, los cuales me comprometo a cuidar y utilizar únicamente en las actividades inherentes a las funciones que me sean asignadas, de igual manera a devolverlos cuando me sean requeridos, en las mismas condiciones de operatividad en que los estoy recibiendo, a tales efectos autorizo a la Corporación Modo Caracas a que me descuente los equipos que me fueron asignados en caso de no devolverlos al momento que me sean requeridos si no existiere una causa comprobable que lo justifique.   
        </p>
        <div className="grid grid-cols-3 gap-12 pt-8">
          <div className="text-center">
            <div className="border-t border-black pt-2">
              <p className="text-sm">Quien Entrega</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-2">
              <p className="text-sm">Quien recibe</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-2">
              <p className="text-sm underline">Responsable del Área</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function EquipmentAssignmentForm() {
  const [previewValues, setPreviewValues] = useState<FormValues | null>(null)
  const pdfRef = useRef<HTMLDivElement>(null) // Tipado explícito, permite null por defecto

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      assignedTo: "",
      location: "",
      idNumber: "",
      items: [{ serialNumber: "", description: "", quantity: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const onSubmit = useCallback((values: FormValues) => {
    setPreviewValues(values)
  }, [])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const handleDownloadPDF = useCallback(() => {
    if (!pdfRef.current || !previewValues) return

    const opt = {
      margin: [15, 20, 16, 21],
      filename: `acta_entrega_${previewValues.assignedTo.replace(/\s+/g, "_")}_${format(
        previewValues.date,
        "dd-MM-yyyy"
      )}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "letter", orientation: "landscape" },
    }

    html2pdf().set(opt).from(pdfRef.current).save()
  }, [previewValues])

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Persona Asignada</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lugar</FormLabel>
                  <FormControl>
                    <Input placeholder="Ubicación o departamento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="idNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cédula de Identidad</FormLabel>
                  <FormControl>
                    <Input placeholder="Número de cédula" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Sección dinámica para ítems */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Equipos</h3>
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_auto] gap-4 items-end">
                <FormField
                  control={form.control}
                  name={`items.${index}.serialNumber`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serie o Referencia</FormLabel>
                      <FormControl>
                        <Input placeholder="Número de serie" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Input placeholder="Descripción del equipo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ serialNumber: "", description: "", quantity: 1 })}
            >
              <Plus className="mr-2 h-4 w-4" /> Agregar Equipo
            </Button>
          </div>

          <Button type="submit" className="w-full">Generar Acta de Entrega</Button>
        </form>
      </Form>

      {previewValues && (
        <div className="print:block" id="preview-section">
          <div className="flex justify-between items-center mb-4 print:hidden pdf-actions">
            <h3 className="text-xl font-semibold">Vista Previa</h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Imprimir
              </Button>
              <Button variant="default" onClick={handleDownloadPDF}>
                <Download className="mr-2 h-5 w-5" /> Descargar PDF
              </Button>
            </div>
          </div>
          <AssignmentPreview values={previewValues} pdfRef={pdfRef} />
        </div>
      )}
    </div>
  )
}




// "use client"

// import { useState, useRef } from "react"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { z } from "zod"
// import { format } from "date-fns"
// import { es } from "date-fns/locale"
// import { CalendarIcon, Printer, Download } from "lucide-react"
// import html2pdf from "html2pdf.js"
// import Image from "next/image"

// import { Button } from "@/components/ui/button"
// import { Calendar } from "@/components/ui/calendar"
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
// import { Input } from "@/components/ui/input"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { cn } from "@/lib/utils"

// const formSchema = z.object({
//   date: z.date({
//     required_error: "La fecha es requerida",
//   }),
//   assignedTo: z.string().min(2, {
//     message: "El nombre debe tener al menos 2 caracteres",
//   }),
//   location: z.string().min(2, {
//     message: "El lugar debe tener al menos 2 caracteres",
//   }),
//   idNumber: z.string().min(1, {
//     message: "El número de cédula es requerido",
//   }),
//   serialNumber: z.string().min(1, {
//     message: "El número de serie es requerido",
//   }),
//   description: z.string().min(1, {
//     message: "La descripción es requerida",
//   }),
//   quantity: z.union([
//     z.string().min(1, { message: "La cantidad es requerida" }),
//     z.coerce.number().min(1, { message: "La cantidad debe ser al menos 1" }),
//   ]),
// })

// export function EquipmentAssignmentForm() {
//   const [showPreview, setShowPreview] = useState(false)
//   const pdfRef = useRef<HTMLDivElement>(null)

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       date: new Date(),
//       assignedTo: "",
//       location: "",
//       idNumber: "",
//       serialNumber: "",
//       description: "",
//       quantity: 1,
//     },
//   })

//   function onSubmit(values: z.infer<typeof formSchema>) {
//     setShowPreview(true)
//   }

//   function handlePrint() {
//     window.print()
//   }

//   function handleDownloadPDF() {
//     if (pdfRef.current) {
//       const element = pdfRef.current
//       const opt = {
//         margin: [15, 20, 16, 21], // [top, right, bottom, left] in millimeters
//         filename: `acta_entrega_${form.getValues("assignedTo").replace(/\s+/g, "_")}_${format(form.getValues("date"), "dd-MM-yyyy")}.pdf`,
//         image: { type: "jpeg", quality: 0.98 },
//         html2canvas: { scale: 2, useCORS: true },
//         jsPDF: { unit: "mm", format: "letter", orientation: "portrait" },
//       }

//       const actionsDiv = document.querySelector(".pdf-actions")
//       if (actionsDiv) {
//         actionsDiv.classList.add("hidden")
//       }

//       html2pdf()
//         .set(opt)
//         .from(element)
//         .save()
//         .then(() => {
//           if (actionsDiv) {
//             actionsDiv.classList.remove("hidden")
//           }
//         })
//     }
//   }

//   return (
//     <div className="space-y-8">
//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <FormField
//               control={form.control}
//               name="date"
//               render={({ field }) => (
//                 <FormItem className="flex flex-col">
//                   <FormLabel>Fecha</FormLabel>
//                   <Popover>
//                     <PopoverTrigger asChild>
//                       <FormControl>
//                         <Button
//                           variant={"outline"}
//                           className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
//                         >
//                           {field.value ? (
//                             format(field.value, "dd/MM/yyyy", { locale: es })
//                           ) : (
//                             <span>Seleccionar fecha</span>
//                           )}
//                           <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                         </Button>
//                       </FormControl>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-auto p-0" align="start">
//                       <Calendar
//                         mode="single"
//                         selected={field.value}
//                         onSelect={field.onChange}
//                         disabled={(date) => date < new Date("1900-01-01")}
//                         initialFocus
//                       />
//                     </PopoverContent>
//                   </Popover>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="assignedTo"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Persona Asignada</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Nombre completo" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="location"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Lugar</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Ubicación o departamento" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="idNumber"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Cédula de Identidad</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Número de cédula" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="serialNumber"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Serie o Referencia del Equipo</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Número de serie del equipo" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="description"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Descripción</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Descripción del equipo" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="quantity"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Cantidad</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Cantidades separadas por comas" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </div>
//           <Button type="submit" className="w-full">
//             Generar Acta de Entrega
//           </Button>
//         </form>
//       </Form>

//       {showPreview && (
//         <div className="print:block" id="preview-section">
//           <div className="flex justify-between items-center mb-4 print:hidden pdf-actions">
//             <h3 className="text-xl font-semibold">Vista Previa</h3>
//             <div className="flex gap-2">
//               <Button variant="outline" onClick={handlePrint}>
//                 <Printer className="mr-2 h-4 w-4" />
//                 Imprimir
//               </Button>
//               <Button variant="default" onClick={handleDownloadPDF}>
//                 <Download className="mr-2 h-5 w-5" />
//                 Descargar PDF
//               </Button>
//             </div>
//           </div>
//           <div ref={pdfRef} className="bg-white">
   
//             <div className="max-w-[8.5in] mx-auto">
//               <div className="space-y-2 md:space-y-3">
//                 <div className="flex items-center border-[1px] border-gray-300 p-2">
//                   <Image
//                     src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-gQSfpgvgyQxf0yRwZnjkfdp4vrI1lM.png"
//                     alt="Logo MODO"
//                     width={80}
//                     height={53}
//                     className="mr-4"
//                   />
//                   <div className="py-2">
//                     <p className="text-base font-semibold">ACTA DE ENTREGA DE EQUIPOS Y HERRAMIENTAS</p>
//                     <p className="text-sm">CORPORACIÓN MODO CARACAS, C.A</p>
//                   </div>
//                 </div>
//                 <br />

//                 <table className="w-full border-collapse">
//                   <tbody>
//                     <tr className="border-[1px] border-gray-300">
//                       <td className="py-1 px-2 w-1/4 font-semibold text-xs md:text-sm">Fecha:</td>
//                       <td className="py-1 px-2 border-l-[1px] border-gray-300 text-xs md:text-sm">
//                         {format(form.getValues("date"), "dd/MM/yyyy", { locale: es })}
//                       </td>
//                     </tr>
//                     <tr>
//                       <td className="border border-gray-300 px-1 py-1">Persona Asignada:</td>
//                       <td className="border border-gray-300 px-1 py-1">{form.getValues("assignedTo")}</td>
//                     </tr>
//                     <tr>
//                       <td className="border border-gray-300 px-1 py-1">Lugar:</td>
//                       <td className="border border-gray-300 px-1 py-1">{form.getValues("location")}</td>
//                     </tr>
//                   </tbody>
//                 </table><br />

                
//                 <table className="w-full border-collapse">
//                   <thead>
//                     <tr>
//                       <th className="border border-gray-300 px-2 py-1 text-center">
//                         SERIE O REFERENCIA
//                         <br />
//                         DEL EQUIPO
//                       </th>
//                       <th className="border border-gray-300 px-2 py-1 text-center">DESCRIPCIÓN</th>
//                       <th className="border border-gray-300 px-2 py-1 text-center">CANTIDAD</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {form
//                       .getValues("serialNumber")
//                       .split(",")
//                       .map((serial, index) => {
//                         const descriptions = form.getValues("description").split(",")
//                         const quantities = form.getValues("quantity").toString().split(",")

//                         const description = index < descriptions.length ? descriptions[index].trim() : ""
//                         const quantity = index < quantities.length ? quantities[index].trim() : "1"

//                         return (
//                           <tr key={index}>
//                             <td className="border border-gray-300 px-2 py-1 text-center">{serial.trim()}</td>
//                             <td className="border border-gray-300 px-2 py-1 text-center">{description}</td>
//                             <td className="border border-gray-300 px-2 py-1 text-center">{quantity}</td>
//                           </tr>
//                         )
//                       })}
                    
//                   </tbody>
//                 </table>


//                 <div className="space-y-10 pt-4">
//                   <p className="text-sm leading-relaxed">
//                     Yo, <span className="font-semibold">{form.getValues("assignedTo")}</span> titular de la cédula de
//                     identidad No. <span className="font-semibold">{form.getValues("idNumber")}</span>, declaro haber
//                     recibido mediante la presente Acta, los equipos mencionados en este documento en perfectas
//                     condiciones de operatividad, los cuales me comprometo a cuidar y utilizar únicamente en las
//                     actividades inherentes a las funciones que me sean asignadas. De igual manera a devolverlos cuando
//                     me sean requeridos, en las mismas condiciones de operatividad en que los estoy recibiendo; a tales
//                     efectos autorizo a la Corporación Modo Caracas a que me descuente los equipos que me fueron
//                     asignados en caso de no devolverlos al momento que me sean requeridos si no existe una causa
//                     comprobable que lo justifique.
//                   </p>

//                   <div className="grid grid-cols-3 gap-12 pt-8">
//                     <div className="text-center">
//                       <div className="border-t border-black pt-2">
//                         <p className="text-sm">Quien Entrega</p>
//                       </div>
//                     </div>
//                     <div className="text-center">
//                       <div className="border-t border-black pt-2">
//                         <p className="text-sm">Quien recibe</p>
//                       </div>
//                     </div>
//                     <div className="text-center">
//                       <div className="border-t border-black pt-2">
//                         <p className="text-sm underline">Responsable del Área</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

