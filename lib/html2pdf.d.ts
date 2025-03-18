declare module "html2pdf.js" {
  function html2pdf(): {
    set: (options: any) => any
    from: (element: HTMLElement) => any
  }
  export = html2pdf
}

